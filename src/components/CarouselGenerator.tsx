import React, { useState, useCallback, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { SlideContent, TemplateId, ImageGenOptions } from '../types';
import { generateCarouselContent, generateImageFromPrompt } from '../services/geminiService';
import { MagicWandIcon, LightBulbIcon, BrandIcon, DownloadIcon, SaveIcon, TrashIcon, PlusIcon, UndoIcon, RedoIcon } from './icons';
import Loader from './Loader';
import SlideCard from './SlideCard';
import VisualCarouselPreview from './VisualCarouselPreview';
import { TemplateSelector } from './TemplateSelector';
import { ImageGenModal } from './ImageGenModal';

interface CarouselGeneratorProps {
    apiKey: string;
    onError: (message: string) => void;
    onNotification: (message: string) => void;
    onRequireApiKey: () => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const CarouselGenerator: React.FC<CarouselGeneratorProps> = ({ apiKey, onError, onNotification, onRequireApiKey }) => {
  const [topic, setTopic] = useState<string>('');
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId>('minimalist');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const draggedSlideIndex = useRef<number | null>(null);

  // Undo/Redo state
  const [history, setHistory] = useState<SlideContent[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Image Gen Modal State
  const [isImageGenerating, setIsImageGenerating] = useState<boolean>(false);
  const [imageGenModal, setImageGenModal] = useState<{ isOpen: boolean; slideIndex: number | null }>({ isOpen: false, slideIndex: null });


  useEffect(() => {
    loadDraft();
  }, []);

  useEffect(() => {
    const debounceSave = setTimeout(() => {
        if (slides.length > 0) {
            saveDraft();
        }
    }, 1000);
    return () => clearTimeout(debounceSave);
  }, [slides, logo, templateId]);
  
  const setSlidesWithHistory = (updater: React.SetStateAction<SlideContent[]>) => {
    const newSlides = typeof updater === 'function' ? updater(slides) : updater;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSlides);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSlides(newSlides);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSlides(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSlides(history[newIndex]);
    }
  };

  const saveDraft = () => {
      setIsSaving(true);
      try {
        const draft = { slides, logo, templateId };
        localStorage.setItem('carouselDraft', JSON.stringify(draft));
        setTimeout(() => setIsSaving(false), 1500);
      } catch (e) {
        console.error("Failed to save draft", e);
        setIsSaving(false);
      }
  };

  const loadDraft = () => {
      try {
          const savedDraft = localStorage.getItem('carouselDraft');
          if (savedDraft) {
              const { slides, logo, templateId } = JSON.parse(savedDraft);
              setSlides(slides);
              setHistory([slides]);
              setHistoryIndex(0);
              setLogo(logo);
              setTemplateId(templateId);
          }
      } catch (e) {
          console.error("Failed to load draft", e);
      }
  };
  
  const clearDraft = () => {
      localStorage.removeItem('carouselDraft');
      setSlides([]);
      setHistory([]);
      setHistoryIndex(-1);
      setLogo(null);
      setTopic('');
      onError('');
      onNotification('');
  };

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    onError('');
    onNotification('');
    setSlides([]);
    setHistory([]);
    setHistoryIndex(-1);
    
    if (!apiKey) {
        const sampleSlidesData = [
            { title: 'Welcome to 7k Insta!', content: ['This is a sample carousel.', 'Add your Gemini API key in Settings to generate with AI!'], imagePrompt: 'creativity, abstract' },
            { title: 'Easy Text Editing', content: ['Click on any text block to edit.', 'A toolbar will appear for styling.'], imagePrompt: 'design, typography' },
            { title: 'Multiple Templates', content: ['Select a visual style on the right.', 'Find the perfect look for your brand.'], imagePrompt: 'style, pattern' },
            { title: 'AI Caption Generator', content: ['After creating, switch to the Captions tab.', 'Get engaging text and hashtags instantly!'], imagePrompt: 'social media, sharing' }
        ];

        const generatedSlides: SlideContent[] = sampleSlidesData.map((slide, index) => ({
            id: `sample_${Date.now()}_${index}`,
            ...slide,
            imageUrls: [`https://picsum.photos/seed/${encodeURIComponent(slide.imagePrompt)}-${index}/1080/1080`],
            selectedImageIndex: 0,
        }));
        
        setTimeout(() => {
            setSlides(generatedSlides);
            setHistory([generatedSlides]);
            setHistoryIndex(0);
            setIsLoading(false);
        }, 1000);
        return;
    }

    if (!topic.trim()) {
      onError('Please enter a topic to generate a carousel.');
      setIsLoading(false);
      return;
    }

    try {
      let slidesWithContent = await generateCarouselContent(topic, apiKey);
      
      if (slidesWithContent.length > 0) {
        const firstSlide = slidesWithContent[0];
        try {
            const imageUrl = await generateImageFromPrompt(firstSlide, { aspectRatio: '1:1', style: 'Minimalist' }, apiKey);
            slidesWithContent[0] = { ...firstSlide, imageUrls: [imageUrl], selectedImageIndex: 0 };
        } catch (imageError) {
            console.error(`Failed to generate AI image for slide 1:`, imageError);
            onNotification("AI image generation failed. Using stock photos as a fallback.");
            const fallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(firstSlide.imagePrompt)}/1080/1080`;
            slidesWithContent[0] = { ...firstSlide, imageUrls: [fallbackUrl], selectedImageIndex: 0 };
        }

        const finalSlides = slidesWithContent.map((slide, index) => {
            if (index > 0 && (!slide.imageUrls || slide.imageUrls.length === 0)) {
                return {
                    ...slide,
                    imageUrls: [`https://picsum.photos/seed/${encodeURIComponent(slide.imagePrompt)}-${index}/1080/1080`],
                    selectedImageIndex: 0,
                };
            }
            return slide;
        });

        setSlides(finalSlides);
        setHistory([finalSlides]);
        setHistoryIndex(0);
      }

    } catch (err) {
      onError(err instanceof Error ? `Error generating carousel content:\n${err.message}` : 'An unexpected error occurred.');
      setSlides([]);
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKey, onError, onNotification]);

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setLogo(base64);
    }
  };
  
  const handleSlideImageUpload = (slideIndex: number, newImageUrl: string) => {
      setSlidesWithHistory(currentSlides => 
        currentSlides.map((slide, i) => {
            if (i === slideIndex) {
                const newImageUrls = [...slide.imageUrls, newImageUrl];
                return { 
                    ...slide, 
                    imageUrls: newImageUrls,
                    selectedImageIndex: newImageUrls.length - 1 
                };
            }
            return slide;
        })
      );
  };

  const handleOpenImageGenModal = (slideIndex: number) => {
    if (!apiKey) {
        onError("Please set your Gemini API key in the settings before generating images.");
        onRequireApiKey();
        return;
    }
    setImageGenModal({ isOpen: true, slideIndex });
  };

  const handleGenerateWithNewOptions = async (options: ImageGenOptions) => {
    if (imageGenModal.slideIndex === null) return;

    setIsImageGenerating(true);
    const slideIndex = imageGenModal.slideIndex;
    const slideToRegenerate = slides[slideIndex];

    try {
        const newImageUrl = await generateImageFromPrompt(slideToRegenerate, options, apiKey);
        setSlidesWithHistory(currentSlides =>
            currentSlides.map((slide, i) => {
                if (i === slideIndex) {
                    const newImageUrls = [...slide.imageUrls, newImageUrl];
                    return {
                        ...slide,
                        imageUrls: newImageUrls,
                        selectedImageIndex: newImageUrls.length - 1
                    };
                }
                return slide;
            })
        );
        setImageGenModal({ isOpen: false, slideIndex: null }); // Close modal on success
    } catch (err) {
        console.error("Failed to regenerate image", err);
        onError(err instanceof Error ? err.message : "Failed to regenerate image. Please try again.");
        // Don't close modal on error, so user can try again
    } finally {
        setIsImageGenerating(false);
    }
  };

  const handleSelectImage = (slideIndex: number, imageIndex: number) => {
    setSlidesWithHistory(currentSlides =>
        currentSlides.map((slide, i) =>
            i === slideIndex ? { ...slide, selectedImageIndex: imageIndex } : slide
        )
    );
  };

  const handleDeleteImage = (slideIndex: number, imageIndex: number) => {
    setSlidesWithHistory(currentSlides =>
        currentSlides.map((slide, i) => {
            if (i === slideIndex && slide.imageUrls.length > 1) { // Prevent deleting the last image
                const newImageUrls = slide.imageUrls.filter((_, idx) => idx !== imageIndex);
                
                let newSelectedImageIndex = slide.selectedImageIndex;
                if (imageIndex === newSelectedImageIndex) {
                    newSelectedImageIndex = 0;
                } else if (imageIndex < newSelectedImageIndex) {
                    newSelectedImageIndex -= 1;
                }
                
                return {
                    ...slide,
                    imageUrls: newImageUrls,
                    selectedImageIndex: newSelectedImageIndex,
                };
            }
            return slide;
        })
    );
  };

  const handleSlideContentChange = (index: number, field: 'title' | 'content', value: string | string[]) => {
      setSlidesWithHistory(currentSlides =>
        currentSlides.map((slide, i) =>
            i === index ? { ...slide, [field]: value } : slide
        )
      );
  };

  const handleDragStart = (index: number) => {
      draggedSlideIndex.current = index;
  };

  const handleDrop = (dropIndex: number) => {
      if (draggedSlideIndex.current === null) return;

      const dragIndex = draggedSlideIndex.current;
      if (dragIndex === dropIndex) return;

      const newSlides = [...slides];
      const [draggedItem] = newSlides.splice(dragIndex, 1);
      newSlides.splice(dropIndex, 0, draggedItem);
      
      setSlidesWithHistory(newSlides);
      draggedSlideIndex.current = null;
  };
  
  const handleAddSlide = () => {
    const newSlide: SlideContent = {
        id: `manual_${Date.now()}`,
        title: 'New Slide Title',
        content: ['Click to edit this content.', 'Add another point here.'],
        imagePrompt: 'abstract technology background',
        imageUrls: [`https://picsum.photos/seed/new-slide-${Date.now()}/1080/1080`],
        selectedImageIndex: 0,
    };
    setSlidesWithHistory(currentSlides => [...currentSlides, newSlide]);
  };

  const handleDeleteSlide = (slideIndex: number) => {
      if (window.confirm('Are you sure you want to delete this slide?')) {
          setSlidesWithHistory(currentSlides => currentSlides.filter((_, i) => i !== slideIndex));
      }
  };

  const handleDownload = async () => {
      if(slides.length === 0 || !slides.every(s => s.imageUrls.length > 0)) return;
      setIsZipping(true);
      onError('');
      onNotification('');
      try {
        const zip = new JSZip();
        
        for (let i = 0; i < slides.length; i++) {
            const slideElement = document.getElementById(`slide-preview-${i}`);
            if (slideElement) {
                const canvas = await html2canvas(slideElement, {
                    allowTaint: true,
                    useCORS: true,
                    scale: 2,
                });
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
                if (blob) {
                    zip.file(`slide_${i + 1}.jpg`, blob);
                }
            }
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = '7k-insta-carousel.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (zipError) {
          onError("Failed to create zip file. Please try again.");
          console.error("Zipping error:", zipError);
      } finally {
          setIsZipping(false);
      }
  };

  const WelcomeState: React.FC = () => (
    <div className="text-center text-gray-400 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-2xl h-full">
        <LightBulbIcon className="w-16 h-16 text-yellow-400/50 mb-4" />
        <h2 className="text-2xl font-bold text-gray-300 mb-2">Ready to Go Viral?</h2>
        <p>Enter a topic, choose a template, and let our AI craft the perfect Instagram carousel for you. From hooks to calls-to-action, we've got you covered.</p>
    </div>
  );
  
  return (
    <div>
        <div className="bg-gray-800/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., '10 Healthy Habits for a Productive Morning'"
                className="md:col-span-2 w-full h-24 sm:h-auto resize-none bg-gray-900/70 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-700/60 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer text-sm">
                    <BrandIcon className="w-5 h-5"/>
                    <span>{logo ? 'Change Logo' : 'Upload Logo'}</span>
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleLogoChange} />
                </label>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 whitespace-nowrap"
                >
                    <MagicWandIcon className="w-5 h-5"/>
                    {isLoading ? 'Generating...' : 'Generate Carousel'}
                </button>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] gap-8">
            <div className="order-2 lg:order-1">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-300">Content & Assets</h2>
                <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-700 rounded-md p-1">
                            <button
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                                className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Undo"
                            >
                                <UndoIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1}
                                className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Redo"
                            >
                                <RedoIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="w-px h-6 bg-gray-700 mx-1"></div>
                    <div className={`flex items-center gap-1 text-sm text-gray-400 transition-opacity duration-500 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
                        <SaveIcon className="w-4 h-4" />
                        <span>Saved!</span>
                    </div>
                    <button onClick={clearDraft} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-red-500/10">
                        <TrashIcon className="w-4 h-4" />
                        Clear
                    </button>
                    <button onClick={handleDownload} disabled={isZipping || slides.length === 0} className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        <DownloadIcon className="w-5 h-5"/>
                        {isZipping ? 'Zipping...' : 'Download'}
                    </button>
                </div>
            </div>
            
            {isLoading && <div className="h-[400px] flex items-center justify-center"><Loader /></div>}
            
            {!isLoading && slides.length === 0 && <WelcomeState />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {slides.map((slide, index) => (
                    <SlideCard
                    key={slide.id}
                    slide={slide}
                    index={index}
                    onImageUpload={handleSlideImageUpload}
                    onRegenerateImage={handleOpenImageGenModal}
                    onSelectImage={handleSelectImage}
                    onDragStart={() => handleDragStart(index)}
                    onDrop={() => handleDrop(index)}
                    onDelete={() => handleDeleteSlide(index)}
                    onDeleteImage={handleDeleteImage}
                    />
                ))}
                {slides.length > 0 && (
                <button
                    onClick={handleAddSlide}
                    className="flex flex-col items-center justify-center bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-purple-400 hover:border-purple-500 transition-all duration-200 min-h-[300px] aspect-square"
                    aria-label="Add a new slide"
                >
                    <PlusIcon className="w-12 h-12 mb-2" />
                    <span className="font-semibold">Add New Slide</span>
                </button>
                )}
            </div>
            </div>

            <div className="order-1 lg:order-2 lg:sticky lg:top-8 self-start">
            <div className="grid grid-cols-1 gap-8">
                <VisualCarouselPreview
                    slides={slides}
                    logo={logo}
                    templateId={templateId}
                    onSlideContentChange={handleSlideContentChange}
                />
                <TemplateSelector
                    currentTemplate={templateId}
                    onSelectTemplate={setTemplateId}
                />
            </div>
            </div>
        </div>
        {imageGenModal.isOpen && imageGenModal.slideIndex !== null && (
            <ImageGenModal
                isOpen={imageGenModal.isOpen}
                onClose={() => setImageGenModal({ isOpen: false, slideIndex: null })}
                onGenerate={handleGenerateWithNewOptions}
                imagePrompt={slides[imageGenModal.slideIndex]?.imagePrompt || ''}
                isGenerating={isImageGenerating}
            />
        )}
    </div>
  );
};
