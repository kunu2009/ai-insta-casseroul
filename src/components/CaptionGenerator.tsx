import React, { useState } from 'react';
import { SlideContent } from '../types';
import { generateCaptions } from '../services/geminiService';
import Loader from './Loader';
import { MagicWandIcon, CopyIcon, CheckIcon } from './icons';

interface CaptionGeneratorProps {
    slides: SlideContent[];
    apiKey: string;
    onError: (message: string) => void;
}

const CaptionCard: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 relative">
            <p className="text-gray-300 whitespace-pre-wrap">{text}</p>
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                aria-label="Copy caption"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
        </div>
    );
};

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({ slides, apiKey, onError }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [captions, setCaptions] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!apiKey) {
            onError("Please set your Gemini API key in the settings before generating captions.");
            return;
        }
        if (slides.length === 0) {
            onError("Please generate a carousel first before creating captions.");
            return;
        }

        setIsLoading(true);
        onError(''); // Clear previous errors
        setCaptions([]);

        try {
            const generatedCaptions = await generateCaptions(slides, apiKey);
            setCaptions(generatedCaptions);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-300">AI Caption Generator</h2>
                <p className="text-gray-400 mt-1">Generate engaging captions and hashtags for your carousel.</p>
            </div>
            
            <div className="flex justify-center mb-8">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full max-w-sm px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 whitespace-nowrap"
                >
                    <MagicWandIcon className="w-5 h-5"/>
                    {isLoading ? 'Generating...' : 'Generate Captions'}
                </button>
            </div>

            {isLoading && <div className="h-[200px] flex items-center justify-center"><Loader /></div>}

            {!isLoading && captions.length === 0 && (
                <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-2xl">
                    <p>Your generated caption options will appear here.</p>
                </div>
            )}
            
            {!isLoading && captions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {captions.map((caption, index) => (
                        <CaptionCard key={index} text={caption} />
                    ))}
                </div>
            )}
        </div>
    );
};