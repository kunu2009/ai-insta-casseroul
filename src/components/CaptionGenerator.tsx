import React, { useState } from 'react';
import { generateCaptions } from '../services/geminiService';
import Loader from './Loader';
import { MagicWandIcon, CopyIcon, CheckIcon, LightBulbIcon } from './icons';

interface CaptionGeneratorProps {
    apiKey: string;
    onError: (message: string) => void;
    onRequireApiKey: () => void;
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
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 relative h-full">
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

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({ apiKey, onError, onRequireApiKey }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [captions, setCaptions] = useState<string[]>([]);
    const [topic, setTopic] = useState('');

    const handleGenerate = async () => {
        if (!apiKey) {
            onError("Please set your Gemini API key in the settings before generating captions.");
            onRequireApiKey();
            return;
        }
        if (!topic.trim()) {
            onError("Please describe your post to generate captions.");
            return;
        }

        setIsLoading(true);
        onError('');
        setCaptions([]);

        try {
            const generatedCaptions = await generateCaptions(topic, apiKey);
            setCaptions(generatedCaptions);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
             <div className="bg-gray-800/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'A photo of a sunset over the mountains, feeling peaceful.'"
                        className="md:col-span-2 w-full h-24 sm:h-auto resize-none bg-gray-900/70 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-full h-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <MagicWandIcon className="w-5 h-5"/>
                        {isLoading ? 'Generating...' : 'Generate Captions'}
                    </button>
                </div>
            </div>

            {isLoading && <div className="h-[200px] flex items-center justify-center"><Loader /></div>}

            {!isLoading && captions.length === 0 && (
                <div className="text-center text-gray-400 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-2xl h-full">
                    <LightBulbIcon className="w-16 h-16 text-yellow-400/50 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-300 mb-2">Stuck on a caption?</h2>
                    <p>Describe your image or video, and let AI write the perfect caption, complete with hooks, CTAs, and hashtags.</p>
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
