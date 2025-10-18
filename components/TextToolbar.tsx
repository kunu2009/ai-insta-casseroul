import React, { useRef } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, TextSizeIcon, PaletteIcon } from './icons';

interface TextToolbarProps {
  position: { top: number; left: number };
  onCommand: (command: string, value?: string) => void;
}

export const TextToolbar: React.FC<TextToolbarProps> = ({ position, onCommand }) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCommand('foreColor', e.target.value);
  };
  
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // execCommand for fontSize uses values 1-7
    const value = parseInt(e.target.value);
    if(value >= 1 && value <= 7) {
      onCommand('fontSize', String(value));
    }
  };

  const ToolButton: React.FC<{ onClick: () => void, children: React.ReactNode, title: string }> = ({ onClick, children, title }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="p-2 rounded hover:bg-gray-600 transition-colors"
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div
      className="absolute bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 flex items-center gap-1 p-1 z-50"
      style={{ top: position.top, left: position.left, transform: 'translate(-50%, -120%)' }}
      onMouseDown={(e) => e.preventDefault()} // Prevent blur on toolbar click
    >
      <ToolButton onClick={() => onCommand('bold')} title="Bold"><BoldIcon /></ToolButton>
      <ToolButton onClick={() => onCommand('italic')} title="Italic"><ItalicIcon /></ToolButton>
      <ToolButton onClick={() => onCommand('underline')} title="Underline"><UnderlineIcon /></ToolButton>
      <div className="w-px h-6 bg-gray-600 mx-1" />
      <ToolButton onClick={() => onCommand('justifyLeft')} title="Align Left"><AlignLeftIcon /></ToolButton>
      <ToolButton onClick={() => onCommand('justifyCenter')} title="Align Center"><AlignCenterIcon /></ToolButton>
      <ToolButton onClick={() => onCommand('justifyRight')} title="Align Right"><AlignRightIcon /></ToolButton>
      <div className="w-px h-6 bg-gray-600 mx-1" />
      <button 
        onMouseDown={(e) => { e.preventDefault(); colorInputRef.current?.click(); }}
        className="p-2 rounded hover:bg-gray-600 transition-colors relative"
        title="Text Color"
      >
        <PaletteIcon />
        <input ref={colorInputRef} type="color" onChange={handleColorChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
      </button>
      <div className="relative group p-2 rounded hover:bg-gray-600 transition-colors" title="Font Size">
        <TextSizeIcon/>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
            <input 
                type="range" 
                min="1" 
                max="7"
                defaultValue="3"
                step="1" 
                onChange={handleSizeChange} 
                className="w-24"
            />
        </div>
      </div>
    </div>
  );
};