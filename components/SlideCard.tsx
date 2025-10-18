import React, { useState, useRef } from 'react';
import { SlideContent } from '../types';
import { CopyIcon, CheckIcon, UploadIcon, RegenerateIcon } from './icons';

interface SlideCardProps {
  slide: SlideContent;
  index: number;
  onImageUpload: (slideIndex: number, imageUrl: string) => void;
  onRegenerateImage: (slideIndex: number) => Promise<void>;
  onSelectImage: (slideIndex: number, imageIndex: number) => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const SlideCard: React.FC<SlideCardProps> = ({ slide, index, onImageUpload, onRegenerateImage, onSelectImage }) => {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedImageUrl = slide.imageUrls[slide.selectedImageIndex];

  const handleCopy = () => {
    const contentToCopy = `Slide ${index + 1}: ${slide.title}\n\n${slide.content.join('\n- ')}\n\nImage Idea: ${slide.imagePrompt}`;
    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        try {
            const base64 = await blobToBase64(file);
            onImageUpload(index, base64);
        } catch (error) {
            console.error("Error converting file to base64", error);
        }
    }
  };

  const handleRegenerate = async () => {
      setIsRegenerating(true);
      await onRegenerateImage(index);
      setIsRegenerating(false);
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-white">
          <span className="text-purple-400 mr-2">#{index + 1}</span>
          {slide.title}
        </h3>
        <button
          onClick={handleCopy}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          aria-label="Copy slide content"
        >
          {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="aspect-square w-full rounded-md mb-3 bg-gray-900/50 overflow-hidden relative">
        {selectedImageUrl ? (
            <img src={selectedImageUrl} alt={slide.imagePrompt} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )}
      </div>
      
      {slide.imageUrls.length > 1 && (
        <div className="w-full overflow-x-auto pb-2 mb-1">
          <div className="flex items-center gap-2 w-max">
              {slide.imageUrls.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => onSelectImage(index, i)} 
                    className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 ${i === slide.selectedImageIndex ? 'border-purple-500 scale-105 shadow-lg' : 'border-transparent hover:border-gray-500'}`}
                  >
                      <img src={url} alt={`Option ${i+1}`} className="w-full h-full object-cover" />
                  </button>
              ))}
          </div>
        </div>
      )}

      <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm flex-grow">
        {slide.content.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
      <p className="text-xs text-pink-400/80 mt-3 pt-3 border-t border-gray-700">
        <strong>Image Idea:</strong> {slide.imagePrompt}
      </p>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
       <div className="grid grid-cols-2 gap-2 mt-4">
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
        >
            <UploadIcon className="w-4 h-4" />
            Upload
        </button>
        <button 
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/50 text-gray-300 font-semibold rounded-lg hover:bg-purple-600/80 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isRegenerating ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <RegenerateIcon className="w-4 h-4" />
            )}
            Regenerate
        </button>
       </div>
    </div>
  );
};

export default SlideCard;