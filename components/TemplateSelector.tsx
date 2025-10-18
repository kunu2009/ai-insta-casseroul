import React from 'react';
import { TemplateId } from '../types';

interface TemplateSelectorProps {
    currentTemplate: TemplateId;
    onSelectTemplate: (templateId: TemplateId) => void;
}

const templateOptions: { id: TemplateId; name: string; description: string; }[] = [
    { id: 'minimalist', name: 'Minimalist', description: 'Clean, modern, and content-focused.' },
    { id: 'bold', name: 'Bold', description: 'High-contrast with vibrant overlays.' },
    { id: 'dynamic', name: 'Dynamic', description: 'Uses angled shapes for an energetic feel.' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated fonts and subtle frames.' },
    { id: 'gradient', name: 'Gradient', description: 'Modern, with a vibrant gradient overlay.' },
    { id: 'editorial', name: 'Editorial', description: 'Clean, classy, magazine-style layout.' },
    { id: 'retro', name: 'Retro', description: '90s vibe with pixel fonts & neon glow.' },
    { id: 'cinematic', name: 'Cinematic', description: 'Widescreen, film grain, and dramatic text.' },
    { id: 'handwritten', name: 'Handwritten', description: 'Personal, scrapbook-style with cursive.' },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ currentTemplate, onSelectTemplate }) => {
    return (
        <div>
            <p className="text-sm text-gray-400 mb-2 text-center lg:text-left">Choose a visual style</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {templateOptions.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => onSelectTemplate(template.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${currentTemplate === template.id ? 'border-purple-500 bg-purple-900/30' : 'border-gray-700 bg-gray-800/50 hover:border-purple-600'}`}
                    >
                        <p className="font-bold text-sm text-white">{template.name}</p>
                        <p className="text-xs text-gray-400">{template.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};