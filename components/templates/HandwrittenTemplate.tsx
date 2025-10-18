import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const HandwrittenTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];
    
    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center bg-[#F1EFEA] relative text-gray-800 overflow-hidden p-8 font-['Caveat',cursive]">
            {/* Paper texture */}
            <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/paper-fibers.png)'}}></div>
            <div className="w-4/5 h-3/5 relative z-10">
                <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} className="shadow-[8px_8px_15px_rgba(0,0,0,0.2)]" />
            </div>

            {logo && <img src={logo} alt="Brand Logo" className="absolute top-6 right-6 w-14 h-14 object-contain z-30 rounded-full" />}

            <div className="relative z-20 w-full mt-6">
                <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-5xl font-bold mb-4"
                />
                <div className="text-2xl space-y-2 text-gray-700">
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

export default HandwrittenTemplate;