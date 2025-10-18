import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const RetroTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];
    
    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center bg-black relative text-white overflow-hidden p-8 font-['VT323',monospace]">
            <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} className="opacity-50 blur-sm" />
            {/* CRT screen lines effect */}
            <div className="absolute inset-0 bg-black/30 z-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px)', backgroundSize: '100% 4px' }}></div>
            
            {logo && <img src={logo} alt="Brand Logo" className="absolute top-5 left-5 w-16 h-16 object-contain z-30" />}

            <div className="relative z-20 w-full border-4 border-cyan-400 bg-black/50 p-6 shadow-[0_0_20px_theme(colors.cyan.400)]">
                <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-5xl uppercase mb-4 text-pink-400"
                    style={{ textShadow: '3px 3px 0px #000, 0 0 15px #ff00de' }}
                />
                <div className="text-2xl space-y-2 text-cyan-300">
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
                            style={{ textShadow: '2px 2px 0px #000, 0 0 10px #00d9ff' }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RetroTemplate;