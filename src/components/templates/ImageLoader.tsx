import React, { useState, useEffect } from 'react';

interface ImageLoaderProps {
    src?: string | null;
    alt: string;
    className?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ src, alt, className = '' }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    useEffect(() => {
        if (src) {
            setStatus('loading');
        } else {
            // If there's no src, treat it as an error/empty state
            setStatus('error');
        }
    }, [src]);

    const handleLoad = () => {
        setStatus('loaded');
    };
    
    const handleError = () => {
        console.error("Failed to load image:", src);
        setStatus('error');
    };

    return (
        <>
            {status === 'loading' && (
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            {status === 'error' && (
                <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-center p-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-400 text-sm font-semibold">Image Failed to Load</p>
                    <p className="text-gray-500 text-xs mt-1">There was a problem fetching the image.</p>
                </div>
            )}
            {src && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
                />
            )}
        </>
    );
};

export default ImageLoader;