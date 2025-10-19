import React from 'react';
import { TemplateId } from '../types';

interface TemplateSelectorProps {
    currentTemplate: TemplateId;
    onSelectTemplate: (templateId: TemplateId) => void;
}

const templateOptions: { id: TemplateId; name: string; }[] = [
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'bold', name: 'Bold' },
    { id: 'dynamic', name: 'Dynamic' },
    { id: 'elegant', name: 'Elegant' },
    { id: 'gradient', name: 'Gradient' },
    { id: 'editorial', name: 'Editorial' },
    { id: 'retro', name: 'Retro' },
    { id: 'cinematic', name: 'Cinematic' },
    { id: 'handwritten', name: 'Handwritten' },
];

const TemplatePreview: React.FC<{ templateId: TemplateId }> = ({ templateId }) => {
    const baseClasses = "w-full h-16 rounded-md mb-2 flex flex-col items-center justify-center overflow-hidden relative transition-transform duration-200 group-hover:scale-105";

    switch (templateId) {
        case 'minimalist':
            return (
                <div className={`${baseClasses} bg-gray-700`}>
                    <div className="absolute bottom-0 w-full h-1/3 bg-black/30"></div>
                    <div className="w-3/4 h-2 bg-gray-300 rounded-full mb-1 z-10"></div>
                    <div className="w-1/2 h-1 bg-gray-400 rounded-full z-10"></div>
                </div>
            );
        case 'bold':
            return (
                <div className={`${baseClasses} bg-purple-600`}>
                    <div className="w-3/4 h-3 bg-white rounded-full mb-1"></div>
                     <div className="w-1/2 h-1 bg-purple-200 rounded-full"></div>
                </div>
            );
        case 'dynamic':
            return (
                 <div className={`${baseClasses} bg-gray-800`}>
                    <div className="absolute inset-0 bg-black/60" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' }}></div>
                    <div className="relative w-3/4 h-2 bg-gray-300 rounded-full ml-[-10%] border-l-2 border-pink-500 pl-1"></div>
                </div>
            );
        case 'elegant':
            return (
                <div className={`${baseClasses} bg-gray-400 p-1`}>
                    <div className="w-full h-full border-2 border-white/80"></div>
                </div>
            );
        case 'gradient':
             return <div className={`${baseClasses} bg-gradient-to-br from-pink-500 to-purple-600`}></div>;
        case 'editorial':
            return (
                <div className={`${baseClasses} bg-white flex-col justify-start`}>
                    <div className="w-full h-3/5 bg-gray-400"></div>
                    <div className="w-5/6 h-2 bg-gray-800 rounded-full mt-2"></div>
                </div>
            );
        case 'retro':
            return (
                <div className={`${baseClasses} bg-black p-1`}>
                    <div className="w-full h-full border-2 border-cyan-400 flex items-center justify-center">
                         <div className="w-3/4 h-2 bg-pink-400 rounded-full"></div>
                    </div>
                </div>
            );
        case 'cinematic':
            return (
                 <div className={`${baseClasses} bg-gray-600`}>
                    <div className="absolute top-0 w-full h-[15%] bg-black"></div>
                    <div className="absolute bottom-0 w-full h-[15%] bg-black"></div>
                    <div className="w-3/4 h-2 bg-white rounded-full"></div>
                </div>
            );
        case 'handwritten':
            return (
                 <div className={`${baseClasses} bg-[#F1EFEA]`}>
                     <div className="w-3/5 h-2/5 bg-gray-400 shadow-md transform -rotate-3"></div>
                     <div className="w-1/2 h-2 bg-gray-700 rounded-full mt-2"></div>
                </div>
            );
        default:
            return <div className={`${baseClasses} bg-gray-600`}></div>;
    }
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ currentTemplate, onSelectTemplate }) => {
    return (
        <div>
            <p className="text-sm text-gray-400 mb-2 text-center lg:text-left">Choose a visual style</p>
            <div className="grid grid-cols-3 gap-3">
                {templateOptions.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        className={`group p-2 rounded-lg border-2 text-center transition-all duration-200 ${currentTemplate === template.id ? 'border-purple-500 bg-purple-900/30' : 'border-gray-700 bg-gray-800/50 hover:border-purple-600'}`}
                    >
                        <TemplatePreview templateId={template.id} />
                        <p className="font-bold text-xs text-white mt-1">{template.name}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};