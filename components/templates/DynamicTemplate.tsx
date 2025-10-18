import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const DynamicTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];

    return (
        <div className="w-full h-full bg-gray-800 relative text-white overflow-hidden font-[Roboto,sans-serif]">
            <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} />
            <div 
                className="absolute inset-0 bg-black/60 z-10"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' }}
            ></div>
            
            {logo && <img src={logo} alt="Brand Logo" className="absolute top-5 right-5 w-16 h-16 object-contain z-30" />}

            <div className="relative z-20 w-full h-full flex flex-col justify-center p-10 text-left">
                <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-4xl font-bold leading-tight mb-4"
                />
                <div className="text-lg text-gray-200 space-y-2 border-l-4 border-pink-500 pl-4">
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

export default DynamicTemplate;