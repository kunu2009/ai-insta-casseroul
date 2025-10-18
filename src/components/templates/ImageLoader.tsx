import React, { useState, useEffect } from 'react';

interface ImageLoaderProps {
    src?: string | null;
    alt: string;
    className?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ src, alt, className = '' }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    return (
        <>
            {isLoading && (
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            {src && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
                />
            )}
        </>
    );
};

export default ImageLoader;
