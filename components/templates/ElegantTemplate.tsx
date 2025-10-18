import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const ElegantTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];

    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center bg-gray-100 relative text-gray-800 overflow-hidden p-12 font-serif">
            <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} />
            <div className="absolute inset-0 bg-black/20 z-10"></div>
            
            {/* Frame effect */}
            <div className="absolute inset-4 border-2 border-white/80 z-20"></div>

            {logo && <img src={logo} alt="Brand Logo" className="absolute top-8 left-8 w-14 h-14 object-contain z-30" />}

            <div className="relative z-30 w-full text-white">
                <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-4xl font-medium tracking-wide mb-5"
                     style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.4)' }}
                />
                 <div className="w-20 h-0.5 bg-white/70 mx-auto mb-5"></div>
                <div className="text-lg text-gray-100 space-y-2">
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
                            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ElegantTemplate;