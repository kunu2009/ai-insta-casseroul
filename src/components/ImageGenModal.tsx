import React, { useState, useEffect } from 'react';
import { ImageGenOptions, ImageAspectRatio, ImageStyle } from '../types';
import { SlidersIcon } from './icons';

interface ImageGenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (options: ImageGenOptions) => Promise<void>;
    imagePrompt: string;
    isGenerating: boolean;
}

const ASPECT_RATIOS: { value: ImageAspectRatio; label: string }[] = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '16:9', label: 'Landscape (16:9)' },
];

const STYLES: ImageStyle[] = ['Photorealistic', 'Abstract', 'Illustration', 'Minimalist', '3D Render', 'Anime'];

export const ImageGenModal: React.FC<ImageGenModalProps> = ({ isOpen, onClose, onGenerate, imagePrompt, isGenerating }) => {
    const [options, setOptions] = useState<ImageGenOptions>({
        aspectRatio: '1:1',
        style: 'Minimalist',
        colorPalette: '',
    });

    useEffect(() => {
        // Reset state when modal opens
        if (isOpen) {
            setOptions({
                aspectRatio: '1:1',
                style: 'Minimalist',
                colorPalette: '',
            });
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        await onGenerate(options);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 w-full max-w-lg m-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <SlidersIcon className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold">Image Generation Options</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Base Prompt</label>
                        <p className="text-sm bg-gray-900 border border-gray-600 rounded-lg p-2 text-pink-300/90">{imagePrompt}</p>
                    </div>

                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-1">Aspect Ratio</label>
                        <select
                            id="aspectRatio"
                            value={options.aspectRatio}
                            onChange={(e) => setOptions(prev => ({ ...prev, aspectRatio: e.target.value as ImageAspectRatio }))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            {ASPECT_RATIOS.map(ar => <option key={ar.value} value={ar.value}>{ar.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-1">Style</label>
                        <select
                            id="style"
                            value={options.style}
                            onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value as ImageStyle }))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                            {STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="colorPalette" className="block text-sm font-medium text-gray-300 mb-1">
                            Color Palette <span className="text-gray-500">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="colorPalette"
                            value={options.colorPalette}
                            onChange={(e) => setOptions(prev => ({ ...prev, colorPalette: e.target.value }))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="e.g., warm earth tones, vibrant neon"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center w-36 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Generate Image'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
