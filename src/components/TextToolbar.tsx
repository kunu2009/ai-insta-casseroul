import React, { useRef } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, TextSizeIcon, PaletteIcon, StrikethroughIcon, TextShadowIcon, TextOutlineIcon, FontFamilyIcon } from './icons';

interface TextToolbarProps {
  position: { top: number; left: number };
  placement: 'top' | 'bottom';
  onCommand: (command: string, value?: string) => void;
}

const FONT_FAMILIES = [
  // Google Fonts from index.html
  'Playfair Display',
  'Lato',
  'Poppins',
  'Inter',
  'Roboto',
  'Montserrat',
  'VT323',
  'Bebas Neue',
  'Caveat',
  // Web Safe Fonts
  'Arial',
  'Verdana',
  'Georgia',
  'Times New Roman',
];


export const TextToolbar: React.FC<TextToolbarProps> = ({ position, placement, onCommand }) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCommand('foreColor', e.target.value);
  };
  
  const handleSizeChange = (e: React.FormEvent<HTMLInputElement>) => {
    // execCommand for fontSize uses values 1-7
    const value = parseInt(e.currentTarget.value);
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
  
  const transformStyle = placement === 'top'
    ? 'translate(-50%, -120%)'
    : 'translate(-50%, 20%)';

  const dropdownPositionClass = placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const commonDropdownClasses = 'absolute left-1/2 -translate-x-1/2 bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity';


  return (
    <div
      className="absolute bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 flex items-center gap-1 p-1 z-50"
      style={{ top: position.top, left: position.left, transform: transformStyle }}
      onMouseDown={(e) => e.preventDefault()} // Prevent blur on toolbar click
    >
        {/* Style Controls */}
        <ToolButton onClick={() => onCommand('bold')} title="Bold"><BoldIcon /></ToolButton>
        <ToolButton onClick={() => onCommand('italic')} title="Italic"><ItalicIcon /></ToolButton>
        <ToolButton onClick={() => onCommand('underline')} title="Underline"><UnderlineIcon /></ToolButton>
        <ToolButton onClick={() => onCommand('strikeThrough')} title="Strikethrough"><StrikethroughIcon /></ToolButton>
        
        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Font Controls */}
        <div className="relative group p-2 rounded hover:bg-gray-600 transition-colors" title="Font Family">
            <FontFamilyIcon />
            <div className={`${commonDropdownClasses} ${dropdownPositionClass} p-1 flex flex-col items-start w-40 max-h-60 overflow-y-auto z-10`}>
                {FONT_FAMILIES.map(font => (
                    <button
                        key={font}
                        onMouseDown={(e) => { e.preventDefault(); onCommand('fontName', font); }}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-gray-600 rounded"
                        style={{ fontFamily: font }}
                    >
                        {font}
                    </button>
                ))}
            </div>
        </div>
        <div className="relative group p-2 rounded hover:bg-gray-600 transition-colors" title="Font Size">
            <TextSizeIcon/>
            <div className={`${commonDropdownClasses} ${dropdownPositionClass} p-2`}>
                <input 
                    type="range" 
                    min="1" 
                    max="7"
                    defaultValue="3"
                    step="1" 
                    onInput={handleSizeChange}
                    className="w-24"
                />
            </div>
        </div>
        <button 
            onMouseDown={(e) => { e.preventDefault(); colorInputRef.current?.click(); }}
            className="p-2 rounded hover:bg-gray-600 transition-colors relative"
            title="Text Color"
        >
            <PaletteIcon />
            <input ref={colorInputRef} type="color" onChange={handleColorChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </button>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Alignment Controls */}
        <ToolButton onClick={() => onCommand('justifyLeft')} title="Align Left"><AlignLeftIcon /></ToolButton>
        <ToolButton onClick={() => onCommand('justifyCenter')} title="Align Center"><AlignCenterIcon /></ToolButton>
        <ToolButton onClick={() => onCommand('justifyRight')} title="Align Right"><AlignRightIcon /></ToolButton>

        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* Effect Controls */}
        <ToolButton onClick={() => onCommand('textShadow')} title="Text Shadow"><TextShadowIcon /></ToolButton>
        <ToolButton onClick={() => onCommand('textOutline')} title="Text Outline"><TextOutlineIcon /></ToolButton>
    </div>
  );
};