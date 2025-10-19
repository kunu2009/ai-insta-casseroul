import React, { useState } from 'react';
import { generateIdeas } from '../services/geminiService';
import Loader from './Loader';
import { MagicWandIcon, CopyIcon, CheckIcon, LightBulbIcon } from './icons';
import { Idea } from '../types';

interface IdeaGeneratorProps {
    apiKey: string;
    onError: (message: string) => void;
    onRequireApiKey: () => void;
    onUseIdea: (ideaTopic: string) => void;
}

const IdeaCard: React.FC<{ idea: Idea, onUse: () => void }> = ({ idea, onUse }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textToCopy = `${idea.title}\n\n${idea.description}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 h-full flex flex-col">
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-purple-300 mb-2">{idea.title}</h3>
                <p className="text-gray-400 text-sm">{idea.description}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700/50">
                <button
                    onClick={onUse}
                    className="flex-1 text-center py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md text-sm transition-colors"
                >
                    Use this Idea
                </button>
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                    aria-label="Copy idea"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({ apiKey, onError, onRequireApiKey, onUseIdea }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [niche, setNiche] = useState('');

    const handleGenerate = async () => {
        if (!apiKey) {
            onError("Please set your Gemini API key in the settings before generating ideas.");
            onRequireApiKey();
            return;
        }
        if (!niche.trim()) {
            onError("Please enter a niche or topic to generate ideas.");
            return;
        }

        setIsLoading(true);
        onError('');
        setIdeas([]);

        try {
            const generatedIdeas = await generateIdeas(niche, apiKey);
            setIdeas(generatedIdeas);
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
                    <input
                        type="text"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="e.g., 'Vegan baking', 'Indie game development'"
                        className="md:col-span-2 w-full bg-gray-900/70 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                        disabled={isLoading}
                        onKeyUp={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-full h-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <MagicWandIcon className="w-5 h-5"/>
                        {isLoading ? 'Generating...' : 'Generate Ideas'}
                    </button>
                </div>
            </div>

            {isLoading && <div className="h-[200px] flex items-center justify-center"><Loader /></div>}

            {!isLoading && ideas.length === 0 && (
                <div className="text-center text-gray-400 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-2xl h-full">
                    <LightBulbIcon className="w-16 h-16 text-yellow-400/50 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-300 mb-2">Writer's Block?</h2>
                    <p>Enter your niche or a general topic, and let AI brainstorm your next viral post. We'll give you hooks, angles, and content concepts to get you started.</p>
                </div>
            )}
            
            {!isLoading && ideas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.map((idea, index) => (
                        <IdeaCard key={index} idea={idea} onUse={() => onUseIdea(idea.title)} />
                    ))}
                </div>
            )}
        </div>
    );
};