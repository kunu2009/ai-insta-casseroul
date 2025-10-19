import React from 'react';
import { TemplateProps } from './types';
import Editable from './Editable';
import ImageLoader from './ImageLoader';

const EditorialTemplate: React.FC<TemplateProps> = ({ slide, logo, onContentChange }) => {
    const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];

    return (
        <div className="w-full h-full flex flex-col bg-white relative text-gray-900 overflow-hidden font-[Playfair Display,serif]">
            <div className="w-full h-3/5 relative">
                <ImageLoader src={selectedImageUrl} alt={slide.imagePrompt} />
                {logo && <img src={logo} alt="Brand Logo" className="absolute top-4 left-4 w-14 h-14 object-contain z-30 mix-blend-screen" />}
            </div>
            <div className="w-full h-2/5 p-8 flex flex-col justify-center">
                <Editable
                    tagName="h2"
                    html={slide.title}
                    onChange={(newVal) => onContentChange('title', newVal)}
                    className="text-3xl font-bold leading-tight mb-3"
                />
                <div className="text-base text-gray-600 space-y-2 font-[Lato,sans-serif]">
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

export default EditorialTemplate;