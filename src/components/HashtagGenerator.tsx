import React, { useState } from 'react';
import { generateHashtags } from '../services/geminiService';
import Loader from './Loader';
import { MagicWandIcon, CopyIcon, CheckIcon, LightBulbIcon } from './icons';
import { HashtagGroup } from '../types';

interface HashtagGeneratorProps {
    apiKey: string;
    onError: (message: string) => void;
    onRequireApiKey: () => void;
}

const HashtagGroupCard: React.FC<{ group: HashtagGroup }> = ({ group }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textToCopy = group.hashtags.join(' ');
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const categoryColors: Record<string, string> = {
        'Broad': 'bg-blue-500/20 text-blue-300',
        'Niche': 'bg-purple-500/20 text-purple-300',
        'Community': 'bg-pink-500/20 text-pink-300'
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 relative h-full">
            <div className="flex justify-between items-center mb-3">
                <h3 className={`font-bold text-lg px-3 py-1 rounded-full text-sm ${categoryColors[group.category] || 'bg-gray-600'}`}>{group.category}</h3>
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                    aria-label="Copy hashtags"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {group.hashtags.map((tag, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 text-sm font-medium px-2.5 py-1 rounded-full">{tag}</span>
                ))}
            </div>
        </div>
    );
};

export const HashtagGenerator: React.FC<HashtagGeneratorProps> = ({ apiKey, onError, onRequireApiKey }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([]);
    const [topic, setTopic] = useState('');
    const [allCopied, setAllCopied] = useState(false);

    const handleCopyAll = () => {
        const allTags = hashtagGroups.flatMap(g => g.hashtags).join(' ');
        navigator.clipboard.writeText(allTags).then(() => {
            setAllCopied(true);
            setTimeout(() => setAllCopied(false), 2000);
        });
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            onError("Please set your Gemini API key in the settings before generating hashtags.");
            onRequireApiKey();
            return;
        }
        if (!topic.trim()) {
            onError("Please describe your post to generate hashtags.");
            return;
        }

        setIsLoading(true);
        onError('');
        setHashtagGroups([]);

        try {
            const generatedGroups = await generateHashtags(topic, apiKey);
            setHashtagGroups(generatedGroups);
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
                        placeholder="Paste your caption or describe your post..."
                        className="md:col-span-2 w-full h-24 sm:h-auto resize-none bg-gray-900/70 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 placeholder-gray-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-full h-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <MagicWandIcon className="w-5 h-5"/>
                        {isLoading ? 'Generating...' : 'Generate Hashtags'}
                    </button>
                </div>
            </div>

            {isLoading && <div className="h-[200px] flex items-center justify-center"><Loader /></div>}

            {!isLoading && hashtagGroups.length === 0 && (
                <div className="text-center text-gray-400 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-2xl h-full">
                    <LightBulbIcon className="w-16 h-16 text-yellow-400/50 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-300 mb-2">Maximize Your Reach</h2>
                    <p>Describe your post, and let AI generate strategic hashtag groups to help you connect with broad, niche, and community audiences.</p>
                </div>
            )}
            
            {!isLoading && hashtagGroups.length > 0 && (
                 <>
                    <div className="text-right mb-4">
                        <button
                            onClick={handleCopyAll}
                            className="flex items-center justify-center gap-2 ml-auto px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                        >
                            {allCopied ? <><CheckIcon className="w-5 h-5 text-green-400" /> Copied!</> : <><CopyIcon className="w-5 h-5" /> Copy All</>}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hashtagGroups.map((group, index) => (
                            <HashtagGroupCard key={index} group={group} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};