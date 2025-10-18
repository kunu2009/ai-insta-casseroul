import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const GradientTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];

    return (
        <div className="w-full h-full flex flex-col justify-between items-start text-left bg-gray-800 relative text-white overflow-hidden p-8 font-[Montserrat,sans-serif]">
            <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} className="opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/70 via-purple-600/70 to-blue-700/70 z-10"></div>
            
            {logo && <img src={logo} alt="Brand Logo" className="relative w-16 h-16 object-contain z-30" />}

            <div className="relative z-20 w-full mt-auto">
                <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-4xl font-bold tracking-tight mb-4"
                    style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.3)' }}
                />
                <div className="text-lg space-y-2 text-gray-100">
                    {slide.content.map((item, i) => (
                        <Editable
                            key={i}
                            tagName="p"
                            html={item}
                            onChange={(newVal) => {
                                const newContent = [...slide.content];
                                newContent[i] = newVal;
                                onContentChange('content', newContent);
                            }}
                            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.2)' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GradientTemplate;
