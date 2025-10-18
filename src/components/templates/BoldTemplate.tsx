import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const BoldTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];

    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center bg-gray-800 relative text-white overflow-hidden p-8 font-[Poppins,sans-serif]">
            <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} className="opacity-80" />
            <div className="absolute inset-0 bg-purple-600/70 z-10"></div>
            
            <div className="relative z-20 flex flex-col justify-center items-center w-full">
                 <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-5xl font-black uppercase tracking-wider mb-6"
                    style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}
                />
                <div className="text-xl space-y-3 text-purple-100">
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

            {logo && <img src={logo} alt="Brand Logo" className="absolute bottom-5 left-1/2 -translate-x-1/2 w-20 h-20 object-contain z-30" />}
        </div>
    );
};

export default BoldTemplate;
