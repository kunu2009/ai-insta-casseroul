import React, { useState, useEffect } from 'react';
import { generateGif } from '../services/gifService';
import { GifIcon, DownloadIcon } from './icons';

interface GifExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    slideCount: number;
}

type GenerationStatus = 'idle' | 'generating' | 'finished' | 'error';

export const GifExportModal: React.FC<GifExportModalProps> = ({ isOpen, onClose, slideCount }) => {
    const [delay, setDelay] = useState(3); // seconds
    const [status, setStatus] = useState<GenerationStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        // Reset state when modal is closed or opened
        if (isOpen) {
            setStatus('idle');
            setProgress(0);
            setGeneratedUrl(null);
            setErrorMessage('');
            setDelay(3);
        }
    }, [isOpen]);

    const handleGenerate = async () => {
        setStatus('generating');
        setProgress(0);
        setErrorMessage('');

        const slideElementIds = Array.from({ length: slideCount }, (_, i) => `slide-preview-${i}`);

        try {
            const url = await generateGif({
                slideElementIds,
                delay: delay * 1000,
                onProgress: (p) => setProgress(p),
            });
            setGeneratedUrl(url);
            setStatus('finished');
        } catch (err) {
            console.error(err);
            setErrorMessage(err instanceof Error ? err.message : 'An unknown error occurred during GIF generation.');
            setStatus('error');
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'generating':
                return (
                    <div className="text-center">
                        <p className="font-semibold mb-2">Rendering GIF...</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress * 100}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            {`Processing slide ${Math.ceil(progress * slideCount)} of ${slideCount}`}
                        </p>
                    </div>
                );
            case 'finished':
                return (
                    <div className="flex flex-col items-center">
                        <p className="font-semibold mb-4 text-lg">Your GIF is ready!</p>
                        {generatedUrl && (
                            <img src={generatedUrl} alt="Generated Carousel GIF" className="rounded-lg border border-gray-600 max-w-sm w-full mb-4" />
                        )}
                        <a
                            href={generatedUrl ?? '#'}
                            download="7k-insta-carousel.gif"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                        >
                            <DownloadIcon />
                            Download GIF
                        </a>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg">
                        <p className="font-bold mb-2">Generation Failed</p>
                        <p className="text-sm">{errorMessage}</p>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <>
                        <div>
                            <label htmlFor="delay" className="block text-sm font-medium text-gray-300 mb-1">
                                Transition Speed (seconds per slide)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    id="delay"
                                    min="1"
                                    max="10"
                                    step="0.5"
                                    value={delay}
                                    onChange={(e) => setDelay(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <span className="font-bold bg-gray-700 text-white rounded-md px-3 py-1 w-20 text-center">{delay.toFixed(1)}s</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center w-36"
                            >
                                Generate GIF
                            </button>
                        </div>
                    </>
                );
        }
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
                    <GifIcon className="w-6 h-6 text-pink-400" />
                    <h2 className="text-xl font-bold">GIF Export Options</h2>
                </div>
                <div className="space-y-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};