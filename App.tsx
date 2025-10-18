import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { SlideContent } from './types';
import { generateCarouselContent, generateImageFromPrompt } from './services/geminiService';
import { MagicWandIcon, LightBulbIcon, BrandIcon, DownloadIcon } from './components/icons';
import Loader from './components/Loader';
import SlideCard from './components/SlideCard';
import VisualCarouselPreview from './components/VisualCarouselPreview';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate a carousel.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSlides([]);

    try {
      const { slides: textSlides } = await generateCarouselContent(topic);
      setSlides(textSlides);

      const slidesWithImages = await Promise.all(
        textSlides.map(async (slide) => {
          try {
            const imageUrl = await generateImageFromPrompt(slide.imagePrompt);
            return { ...slide, imageUrl };
          } catch (imageError) {
            console.error(`Failed to generate image for slide: "${slide.title}"`, imageError);
            return { ...slide, imageUrl: `https://picsum.photos/seed/${encodeURIComponent(slide.title)}/1080/1080` };
          }
        })
      );
      setSlides(slidesWithImages);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setSlides([]);
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setLogo(base64);
    }
  };
  
  const handleSlideImageChange = (index: number, newImageUrl: string) => {
      setSlides(currentSlides => 
        currentSlides.map((slide, i) => 
            i === index ? { ...slide, imageUrl: newImageUrl } : slide
        )
      );
  };
  
  const handleDownload = async () => {
      if(slides.length === 0 || !slides.every(s => s.imageUrl)) return;
      setIsZipping(true);
      try {
        const zip = new JSZip();
        await Promise.all(slides.map(async (slide, index) => {
            const response = await fetch(slide.imageUrl!);
            const blob = await response.blob();
            zip.file(`slide_${index + 1}.jpg`, blob);
        }));

        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'instagram_carousel.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
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
        <p>Enter a topic above, and let our AI craft the perfect Instagram carousel for you. From hooks to calls-to-action, we've got you covered.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/40 -z-10"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0% 100%)'}}
      ></div>

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            AI Instagram Carousel Generator
          </h1>
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
          
          <div className="min-h-[450px] flex items-center justify-center">
            {isLoading && slides.length === 0 ? <Loader /> : error ? (
              <div className="text-center text-red-400 bg-red-900/20 p-6 rounded-lg border border-red-500/50">
                <p className="font-bold">Oops! Something went wrong.</p>
                <p>{error}</p>
              </div>
            ) : slides.length > 0 ? (
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <VisualCarouselPreview slides={slides} logo={logo}/>
                        <div className="flex flex-col gap-4">
                            <h2 className="text-2xl font-bold text-center lg:text-left">Carousel Script & Images</h2>
                             <button
                                onClick={handleDownload}
                                disabled={isZipping || !slides.every(s => s.imageUrl)}
                                className="flex items-center justify-center gap-2 w-full max-w-sm mx-auto lg:mx-0 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon className="w-5 h-5"/>
                                {isZipping ? 'Zipping...' : 'Download Images'}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                        {slides.map((slide, index) => (
                          <SlideCard key={index} slide={slide} index={index} onImageUpload={handleSlideImageChange} />
                        ))}
                    </div>
                </div>
            ) : <WelcomeState />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
