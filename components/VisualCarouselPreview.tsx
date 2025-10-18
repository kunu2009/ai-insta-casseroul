import React, { useState } from 'react';
import { SlideContent } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

interface VisualCarouselPreviewProps {
  slides: SlideContent[];
  logo?: string | null;
}

const VisualCarouselPreview: React.FC<VisualCarouselPreviewProps> = ({ slides, logo }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!slides || slides.length === 0) {
    return null;
  }
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  
  const Slide: React.FC<{ slide: SlideContent }> = ({ slide }) => (
     <div className="w-full h-full flex-shrink-0 flex flex-col justify-center items-center text-center bg-gray-900 relative text-white overflow-hidden p-8">
        {slide.imageUrl ? (
            <img src={slide.imageUrl} alt={slide.imagePrompt} className="absolute inset-0 w-full h-full object-cover z-0" />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        {logo && <img src={logo} alt="Brand Logo" className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20 object-contain z-30" />}
        
        <div className="relative z-20 flex flex-col justify-center bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.5)'}}>
                {slide.title}
            </h2>
            <ul className="text-base sm:text-lg space-y-2 text-gray-200">
                {slide.content.map((item, i) => (
                    <li key={i} style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>{item}</li>
                ))}
            </ul>
        </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto aspect-square bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
                <Slide key={index} slide={slide} />
            ))}
        </div>

        {slides.length > 1 && (
            <>
                <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full hover:bg-black/60 transition-colors z-30 backdrop-blur-sm" aria-label="Previous slide">
                    <ArrowLeftIcon />
                </button>
                <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full hover:bg-black/60 transition-colors z-30 backdrop-blur-sm" aria-label="Next slide">
                    <ArrowRightIcon />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                    {slides.map((_, i) => (
                        <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-white scale-125' : 'bg-white/40'}`} aria-label={`Go to slide ${i + 1}`} />
                    ))}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default VisualCarouselPreview;
