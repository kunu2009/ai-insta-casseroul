import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const MinimalistTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];
    
    return (
        <div className="w-full h-full flex flex-col justify-end items-center text-center bg-gray-800 relative text-white overflow-hidden p-8 font-[Inter,sans-serif]">
            <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
            
            {logo && <img src={logo} alt="Brand Logo" className="absolute top-5 right-5 w-16 h-16 object-contain z-30" />}

            <div className="relative z-20 w-full">
                <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-4xl font-extrabold tracking-tight mb-4"
                />
                <div className="text-lg space-y-2 text-gray-200">
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
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MinimalistTemplate;
