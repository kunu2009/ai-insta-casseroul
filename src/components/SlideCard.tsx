import React, { useState, useRef } from 'react';
import { SlideContent } from '../types';
import { CopyIcon, CheckIcon, UploadIcon, RegenerateIcon, GripVerticalIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';

interface SlideCardProps {
  slide: SlideContent;
  index: number;
  onImageUpload: (slideIndex: number, imageUrl: string) => void;
  onRegenerateImage: (slideIndex: number) => void;
  onSelectImage: (slideIndex: number, imageIndex: number) => void;
  onDeleteImage: (slideIndex: number, imageIndex: number) => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDelete: () => void;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const SlideCard: React.FC<SlideCardProps> = ({ slide, index, onImageUpload, onRegenerateImage, onSelectImage, onDeleteImage, onDragStart, onDrop, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleRegenerate = () => {
      onRegenerateImage(index);
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = slide.selectedImageIndex === 0 ? slide.imageUrls.length - 1 : slide.selectedImageIndex - 1;
    onSelectImage(index, newIndex);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = slide.selectedImageIndex === slide.imageUrls.length - 1 ? 0 : slide.selectedImageIndex + 1;
    onSelectImage(index, newIndex);
  };

  return (
    <div 
        className={`relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex flex-col h-full overflow-hidden transition-all duration-200 cursor-grab`}
        draggable
        onDragStart={onDragStart}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          onDrop();
        }}
        onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
        }}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDragEnd={() => setIsDragOver(false)}
    >
      {isDragOver && <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500 rounded-t-lg z-10" />}

      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-white pr-24">
          <span className="text-purple-400 mr-2">#{index + 1}</span>
          {slide.title}
        </h3>
        <div className="absolute top-3 right-3 flex items-center">
            <GripVerticalIcon className="w-5 h-5 text-gray-500 hover:text-white transition-colors" />
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              aria-label="Copy slide content"
            >
              {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-md hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400"
              aria-label="Delete slide"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="group/preview aspect-square w-full rounded-md mb-3 bg-gray-900/50 overflow-hidden relative">
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
         {slide.imageUrls.length > 1 && (
            <>
                <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-1.5 rounded-full hover:bg-black/60 transition-all opacity-0 group-hover/preview:opacity-100 focus:opacity-100 z-10"
                    aria-label="Previous image"
                >
                    <ArrowLeftIcon className="w-4 h-4 text-white" />
                </button>
                <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-1.5 rounded-full hover:bg-black/60 transition-all opacity-0 group-hover/preview:opacity-100 focus:opacity-100 z-10"
                    aria-label="Next image"
                >
                    <ArrowRightIcon className="w-4 h-4 text-white" />
                </button>
            </>
        )}
      </div>
      
      {slide.imageUrls.length > 1 && (
        <div className="w-full overflow-x-auto pb-2 mb-1">
          <div className="flex items-center gap-2 w-max">
              {slide.imageUrls.map((url, i) => (
                  <div key={i} className="relative group/thumbnail">
                      <button 
                        onClick={() => onSelectImage(index, i)} 
                        className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 ${i === slide.selectedImageIndex ? 'border-purple-500 scale-105 shadow-lg' : 'border-transparent hover:border-gray-500'}`}
                      >
                          <img src={url} alt={`Option ${i+1}`} className="w-full h-full object-cover" />
                      </button>
                      {slide.imageUrls.length > 1 && (
                          <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteImage(index, i);
                              }}
                              className="absolute top-0 right-0 -mt-1.5 -mr-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover/thumbnail:opacity-100 transition-opacity hover:bg-red-700 transform hover:scale-110"
                              aria-label={`Delete image option ${i + 1}`}
                          >
                            <TrashIcon className="w-3 h-3"/>
                          </button>
                      )}
                  </div>
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/50 text-gray-300 font-semibold rounded-lg hover:bg-purple-600/80 transition-colors duration-200 text-sm"
        >
            <RegenerateIcon className="w-4 h-4" />
            Regenerate
        </button>
       </div>
    </div>
  );
};

export default SlideCard;
