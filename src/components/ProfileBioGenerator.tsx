import React, { useState } from 'react';
import { generateProfileBios } from '../services/geminiService';
import Loader from './Loader';
import { MagicWandIcon, CopyIcon, CheckIcon, LightBulbIcon } from './icons';
import { BioDetails } from '../types';

interface ProfileBioGeneratorProps {
    apiKey: string;
    onError: (message: string) => void;
    onRequireApiKey: () => void;
}

const BioCard: React.FC<{ text: string }> = ({ text }) => {
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

export const ProfileBioGenerator: React.FC<ProfileBioGeneratorProps> = ({ apiKey, onError, onRequireApiKey }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [bios, setBios] = useState<string[]>([]);
    const [details, setDetails] = useState<BioDetails>({
        name: '',
        niche: '',
        cta: '',
        tone: 'Friendly'
    });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            onError("Please set your Gemini API key in the settings first.");
            onRequireApiKey();
            return;
        }
        if (!details.name.trim() || !details.niche.trim() || !details.cta.trim()) {
            onError("Please fill in all the required fields to generate a bio.");
            return;
        }

        setIsLoading(true);
        onError('');
        setBios([]);

        try {
            const generatedBios = await generateProfileBios(details, apiKey);
            setBios(generatedBios);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
             <div className="bg-gray-800/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" value={details.name} onChange={handleInputChange} placeholder="Your Name or Brand" className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500" />
                    <input type="text" name="niche" value={details.niche} onChange={handleInputChange} placeholder="What you do (e.g., Fitness Coach)" className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500" />
                    <input type="text" name="cta" value={details.cta} onChange={handleInputChange} placeholder="Call to Action (e.g., DM for info)" className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500" />
                    <select name="tone" value={details.tone} onChange={handleInputChange} className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500">
                        <option>Friendly</option>
                        <option>Professional</option>
                        <option>Witty</option>
                        <option>Inspirational</option>
                    </select>
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="mt-4 flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                    <MagicWandIcon className="w-5 h-5"/>
                    {isLoading ? 'Generating...' : 'Generate Bios'}
                </button>
            </div>

            {isLoading && <div className="h-[200px] flex items-center justify-center"><Loader /></div>}

            {!isLoading && bios.length === 0 && (
                <div className="text-center text-gray-400 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-2xl h-full">
                    <LightBulbIcon className="w-16 h-16 text-yellow-400/50 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-300 mb-2">Craft the Perfect Bio</h2>
                    <p>Your bio is your digital business card. Fill in your details above and let AI create an engaging and effective bio to attract your ideal followers.</p>
                </div>
            )}
            
            {!isLoading && bios.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bios.map((bio, index) => (
                        <BioCard key={index} text={bio} />
                    ))}
                </div>
            )}
        </div>
    );
};
