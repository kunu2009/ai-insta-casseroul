import React, { useState } from 'react';
import { generateReelScript } from '../services/geminiService';
import Loader from './Loader';
import { MagicWandIcon, CopyIcon, CheckIcon, LightBulbIcon } from './icons';
import { ReelScript } from '../types';

interface ReelScriptGeneratorProps {
    apiKey: string;
    onError: (message: string) => void;
    onRequireApiKey: () => void;
}

const ScriptDisplay: React.FC<{ script: ReelScript }> = ({ script }) => {
    const [copied, setCopied] = useState(false);

    const formatScriptForCopy = () => {
        let text = `Title: ${script.title}\n\n`;
        text += `Hook: ${script.hook}\n\n`;
        script.scenes.forEach((scene, index) => {
            text += `Scene ${index + 1}:\n`;
            text += `- Visual: ${scene.visual}\n`;
            text += `- Script: ${scene.script}\n`;
            text += `- On-Screen Text: ${scene.onScreenText}\n\n`;
        });
        text += `CTA: ${script.cta}`;
        return text;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formatScriptForCopy()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 relative">
             <button
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                aria-label="Copy script"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
            <h2 className="text-2xl font-bold text-purple-300 mb-4">{script.title}</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm uppercase font-semibold text-gray-400 tracking-wider mb-2">🎬 Hook (First 3s)</h3>
                    <p className="text-gray-200 pl-4 border-l-2 border-pink-500">{script.hook}</p>
                </div>
                <div>
                    <h3 className="text-sm uppercase font-semibold text-gray-400 tracking-wider mb-2">🎞️ Scenes / Slides</h3>
                    <div className="space-y-4">
                        {script.scenes.map((scene, index) => (
                            <div key={index} className="pl-4 border-l-2 border-gray-600">
                                <h4 className="font-bold text-gray-200">Scene {index + 1}</h4>
                                <p className="text-sm text-gray-400"><strong className="text-gray-300">Visual:</strong> {scene.visual}</p>
                                <p className="text-sm text-gray-400"><strong className="text-gray-300">Script:</strong> {scene.script}</p>
                                <p className="text-sm text-gray-400"><strong className="text-gray-300">Text On Screen:</strong> {scene.onScreenText}</p>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-sm uppercase font-semibold text-gray-400 tracking-wider mb-2">🚀 Call to Action</h3>
                    <p className="text-gray-200 pl-4 border-l-2 border-pink-500">{script.cta}</p>
                </div>
            </div>
        </div>
    );
};

export const ReelScriptGenerator: React.FC<ReelScriptGeneratorProps> = ({ apiKey, onError, onRequireApiKey }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [script, setScript] = useState<ReelScript | null>(null);
    const [topic, setTopic] = useState('');
    const [format, setFormat] = useState<'Reel' | 'Story'>('Reel');

    const handleGenerate = async () => {
        if (!apiKey) {
            onError("Please set your Gemini API key in the settings first.");
            onRequireApiKey();
            return;
        }
        if (!topic.trim()) {
            onError("Please enter a topic for your video script.");
            return;
        }

        setIsLoading(true);
        onError('');
        setScript(null);

        try {
            const generatedScript = await generateReelScript(topic, format, apiKey);
            setScript(generatedScript);
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
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., How to make the perfect iced coffee"
                        className="md:col-span-2 w-full bg-gray-900/70 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-500"
                        disabled={isLoading}
                    />
                    <div className="flex flex-col gap-2">
                        <div className="grid grid-cols-2 gap-2 bg-gray-900/70 border border-gray-600 rounded-lg p-1">
                            <button onClick={() => setFormat('Reel')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${format === 'Reel' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Reel</button>
                            <button onClick={() => setFormat('Story')} className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${format === 'Story' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Story</button>
                        </div>
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 w-full px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50"
                        >
                            <MagicWandIcon className="w-5 h-5"/>
                            {isLoading ? 'Generating...' : 'Generate Script'}
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && <div className="h-[200px] flex items-center justify-center"><Loader /></div>}

            {!isLoading && !script && (
                <div className="text-center text-gray-400 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-2xl h-full">
                    <LightBulbIcon className="w-16 h-16 text-yellow-400/50 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-300 mb-2">Create Engaging Videos</h2>
                    <p>Enter a topic, choose a format, and let AI write a complete script for your next Reel or Story, including a hook, scenes, and a call-to-action.</p>
                </div>
            )}
            
            {!isLoading && script && <ScriptDisplay script={script} />}
        </div>
    );
};
