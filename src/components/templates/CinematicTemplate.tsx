import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const CinematicTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];
    
    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center bg-black relative text-white overflow-hidden font-['Bebas_Neue',sans-serif]">
            <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} className="opacity-90" />
            {/* Film grain effect */}
            <div className="absolute inset-0 z-10 opacity-15" style={{ backgroundImage: 'url(https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHZ5eG01a2tqYTN2a3R2a3J3ZW9zM3p2eDlyeWN0cmNjdXBoZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o85xsjKAl228i2i5O/giphy.gif)'}}></div>
            <div className="absolute inset-0 bg-black/30 z-20"></div>
            
            {/* Letterbox effect */}
            <div className="absolute top-0 left-0 w-full h-1/12 bg-black z-30"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/12 bg-black z-30"></div>
            
            {logo && <img src={logo} alt="Brand Logo" className="absolute bottom-16 right-8 w-14 h-14 object-contain z-40 opacity-70" />}

            <div className="relative z-40 w-full max-w-lg">
                <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-7xl tracking-widest leading-none mb-4"
                />
                <div className="text-2xl space-y-1 text-gray-200 tracking-wider">
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

export default CinematicTemplate;
