import React, { useState } from 'react';
import { SlideContent, TemplateId } from '../types';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';
import MinimalistTemplate from './templates/MinimalistTemplate';
import BoldTemplate from './templates/BoldTemplate';
import DynamicTemplate from './templates/DynamicTemplate';
import ElegantTemplate from './templates/ElegantTemplate';
import GradientTemplate from './templates/GradientTemplate';
import EditorialTemplate from './templates/EditorialTemplate';
import RetroTemplate from './templates/RetroTemplate';
import CinematicTemplate from './templates/CinematicTemplate';
import HandwrittenTemplate from './templates/HandwrittenTemplate';
import { TemplateProps } from './templates/types';

interface VisualCarouselPreviewProps {
  slides: SlideContent[];
  logo: string | null;
  templateId: TemplateId;
  onSlideContentChange: (index: number, field: 'title' | 'content', value: string | string[]) => void;
}

const templates: Record<TemplateId, React.FC<TemplateProps>> = {
  minimalist: MinimalistTemplate,
  bold: BoldTemplate,
  dynamic: DynamicTemplate,
  elegant: ElegantTemplate,
  gradient: GradientTemplate,
  editorial: EditorialTemplate,
  retro: RetroTemplate,
  cinematic: CinematicTemplate,
  handwritten: HandwrittenTemplate,
};

const VisualCarouselPreview: React.FC<VisualCarouselPreviewProps> = ({ slides, logo, templateId, onSlideContentChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!slides || slides.length === 0) {
    return null;
  }
  
  const SelectedTemplate = templates[templateId];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  
  return (
    <div className="w-full max-w-md mx-auto aspect-square bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
      <div className="relative h-full w-full">
        {/* This container holds all slides for html2canvas to access, but only shows the current one */}
        <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
              <div key={index} id={`slide-preview-${index}`} className="w-full h-full flex-shrink-0">
                <SelectedTemplate 
                  slide={slide} 
                  logo={logo}
                  onContentChange={(field, value) => onSlideContentChange(index, field, value)}
                />
              </div>
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
