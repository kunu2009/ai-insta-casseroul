import React, { useState, useCallback, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { SlideContent, TemplateId } from './types';
import { generateCarouselContent, generateImageFromPrompt } from './services/geminiService';
import { SettingsIcon, MagicWandIcon, LightBulbIcon, BrandIcon, DownloadIcon, SaveIcon, TrashIcon } from './components/icons';
import Loader from './components/Loader';
import SlideCard from './components/SlideCard';
import VisualCarouselPreview from './components/VisualCarouselPreview';
import { TemplateSelector } from './components/TemplateSelector';
import { SettingsModal } from './components/SettingsModal';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId>('minimalist');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const draggedSlideIndex = useRef<number | null>(null);

  useEffect(() => {
    loadDraft();
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
        setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    const debounceSave = setTimeout(() => {
        if (slides.length > 0) {
            saveDraft();
        }
    }, 1000);
    return () => clearTimeout(debounceSave);
  }, [slides, logo, templateId]);


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
      setLogo(null);
      setTopic('');
      setError(null);
      setNotification(null);
  };

  const handleSaveApiKey = (newApiKey: string) => {
      setApiKey(newApiKey);
      localStorage.setItem('geminiApiKey', newApiKey);
  };

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
        setIsLoading(true);
        setError(null);
        setNotification(null);
        setSlides([]);
        // Generate a sample carousel to showcase functionality
        const sampleSlidesData = [
            { title: 'Welcome to 7k Insta!', content: ['This is a sample carousel.', 'Add your Gemini API key in Settings to generate with AI!'], imagePrompt: 'creativity, abstract' },
            { title: 'Easy Text Editing', content: ['Click on any text block to edit.', 'A toolbar will appear for styling.'], imagePrompt: 'design, typography' },
            { title: 'Multiple Templates', content: ['Select a visual style on the right.', 'Find the perfect look for your brand.'], imagePrompt: 'style, pattern' },
            { title: 'Download & Share', content: ['When you\'re ready, download all slides as a zip file.'], imagePrompt: 'social media, sharing' }
        ];

        const generatedSlides: SlideContent[] = sampleSlidesData.map((slide, index) => ({
            id: `sample_${Date.now()}_${index}`,
            ...slide,
            imageUrls: [`https://source.unsplash.com/1080x1080/?${encodeURIComponent(slide.imagePrompt)}&random=${index}`],
            selectedImageIndex: 0,
        }));
        
        // Use a small timeout to simulate loading for better UX
        setTimeout(() => {
            setSlides(generatedSlides);
            setIsLoading(false);
        }, 1000);
        return;
    }

    if (!topic.trim()) {
      setError('Please enter a topic to generate a carousel.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setNotification(null);
    setSlides([]);

    try {
      let slidesWithContent = await generateCarouselContent(topic, apiKey);
      
      if (slidesWithContent.length > 0) {
        const firstSlide = slidesWithContent[0];
        try {
            // Attempt to generate the first image with AI
            const imageUrl = await generateImageFromPrompt(firstSlide.imagePrompt, apiKey);
            slidesWithContent[0] = { ...firstSlide, imageUrls: [imageUrl], selectedImageIndex: 0 };
        } catch (imageError) {
            console.error(`Failed to generate AI image for slide 1:`, imageError);
            setNotification("AI image generation failed. Using stock photos as a fallback.");
            const fallbackUrl = `https://source.unsplash.com/1080x1080/?${encodeURIComponent(firstSlide.imagePrompt)}`;
            slidesWithContent[0] = { ...firstSlide, imageUrls: [fallbackUrl], selectedImageIndex: 0 };
        }

        // Populate the rest of the slides with stock images instantly
        const finalSlides = slidesWithContent.map((slide, index) => {
            if (index > 0 && (!slide.imageUrls || slide.imageUrls.length === 0)) {
                return {
                    ...slide,
                    imageUrls: [`https://source.unsplash.com/1080x1080/?${encodeURIComponent(slide.imagePrompt)}&random=${index}`],
                    selectedImageIndex: 0,
                };
            }
            return slide;
        });

        setSlides(finalSlides);
      }

    } catch (err) {
      setError(err instanceof Error ? `Error generating carousel content:\n${err.message}` : 'An unexpected error occurred.');
      setSlides([]);
    } finally {
      setIsLoading(false);
    }
  }, [topic, apiKey]);

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setLogo(base64);
    }
  };
  
  const handleSlideImageUpload = (slideIndex: number, newImageUrl: string) => {
      setSlides(currentSlides => 
        currentSlides.map((slide, i) => {
            if (i === slideIndex) {
                const newImageUrls = [...slide.imageUrls];
                newImageUrls[slide.selectedImageIndex] = newImageUrl;
                return { ...slide, imageUrls: newImageUrls };
            }
            return slide;
        })
      );
  };

  const handleRegenerateImage = async (slideIndex: number) => {
    if (!apiKey) {
        setError("Please set your Gemini API key in the settings before regenerating images.");
        setIsSettingsModalOpen(true);
        return;
    }
    const slideToRegenerate = slides[slideIndex];
    if (!slideToRegenerate) return;
    
    try {
        const newImageUrl = await generateImageFromPrompt(slideToRegenerate.imagePrompt, apiKey);
        setSlides(currentSlides =>
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
    } catch (err) {
        console.error("Failed to regenerate image", err);
        setNotification(err instanceof Error ? err.message : "Failed to regenerate image. Please try again.");
    }
  };

  const handleSelectImage = (slideIndex: number, imageIndex: number) => {
    setSlides(currentSlides =>
        currentSlides.map((slide, i) =>
            i === slideIndex ? { ...slide, selectedImageIndex: imageIndex } : slide
        )
    );
  };

  const handleSlideContentChange = (index: number, field: 'title' | 'content', value: string | string[]) => {
      setSlides(currentSlides =>
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
      
      setSlides(newSlides);
      draggedSlideIndex.current = null;
  };
  
  const handleDownload = async () => {
      if(slides.length === 0 || !slides.every(s => s.imageUrls.length > 0)) return;
      setIsZipping(true);
      setError(null);
      setNotification(null);
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
          setError("Failed to create zip file. Please try again.");
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
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/40 -z-10"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0% 100%)'}}
      ></div>

      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="w-10"></div> {/* Spacer to keep title centered */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 text-center">
            7k Insta
          </h1>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon className="w-6 h-6 text-gray-300"/>
          </button>
        </header>

        <main>
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
          
          {notification && (
            <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-lg relative mb-6 animate-pulse" role="alert">
                <span className="block sm:inline">{notification}</span>
                <button onClick={() => setNotification(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close notification">
                    <svg className="fill-current h-6 w-6 text-yellow-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
          )}

          <div className="min-h-[450px] flex items-center justify-center">
            {isLoading && slides.length === 0 ? <Loader /> : error ? (
              <div className="text-center text-red-400 bg-red-900/20 p-6 rounded-lg border border-red-500/50">
                <p className="font-bold">Oops! Something went wrong.</p>
                <p className="text-sm whitespace-pre-wrap">{error}</p>
              </div>
            ) : slides.length > 0 ? (
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <VisualCarouselPreview 
                          slides={slides} 
                          logo={logo} 
                          templateId={templateId}
                          onSlideContentChange={handleSlideContentChange}
                        />
                        <div className="flex flex-col gap-4">
                            <h2 className="text-2xl font-bold text-center lg:text-left">Design & Finalize</h2>
                            <TemplateSelector currentTemplate={templateId} onSelectTemplate={setTemplateId} />
                             <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2">
                                <button
                                    onClick={handleDownload}
                                    disabled={isZipping || !slides.every(s => s.imageUrls.length > 0)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    <DownloadIcon className="w-5 h-5"/>
                                    {isZipping ? 'Zipping...' : 'Download Images'}
                                </button>
                                <button onClick={saveDraft} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 text-sm">
                                    <SaveIcon className="w-5 h-5"/>
                                    {isSaving ? 'Saved!' : 'Save Draft'}
                                </button>
                                <button onClick={clearDraft} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-300 text-sm">
                                    <TrashIcon className="w-5 h-5"/>
                                    Clear
                                </button>
                             </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8">
                        <h2 className="text-2xl font-bold text-center mb-4">Content & Assets</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {slides.map((slide, index) => (
                              <SlideCard 
                                key={slide.id} 
                                slide={slide} 
                                index={index} 
                                onImageUpload={handleSlideImageUpload}
                                onRegenerateImage={handleRegenerateImage}
                                onSelectImage={handleSelectImage}
                                onDragStart={() => handleDragStart(index)}
                                onDrop={() => handleDrop(index)}
                              />
                            ))}
                        </div>
                    </div>
                </div>
            ) : <WelcomeState />}
          </div>
        </main>
        <SettingsModal 
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            currentApiKey={apiKey}
            onSave={handleSaveApiKey}
        />
      </div>
    </div>
  );
};

export default App;
