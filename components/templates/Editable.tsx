import React, { useRef, useEffect, useState } from 'react';
import { TextToolbar } from '../TextToolbar';

interface EditableProps {
    html: string;
    onChange: (newHtml: string) => void;
    className?: string;
    tagName?: 'div' | 'h1'| 'h2' | 'p' | 'span';
    style?: React.CSSProperties;
}

const Editable: React.FC<EditableProps> = ({ html, onChange, className, tagName = 'div', style }) => {
    const elementRef = useRef<HTMLElement>(null);
    const [toolbarState, setToolbarState] = useState<{ show: boolean; top: number; left: number }>({ show: false, top: 0, left: 0 });

    useEffect(() => {
        if (elementRef.current && html !== elementRef.current.innerHTML) {
            elementRef.current.innerHTML = html;
        }
    }, [html]);

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setToolbarState({
                show: true,
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX + rect.width / 2,
            });
        } else {
            setToolbarState({ show: false, top: 0, left: 0 });
        }
    };
    
    const handleBlur = () => {
        if (elementRef.current) {
            onChange(elementRef.current.innerHTML);
        }
        setToolbarState({ show: false, top: 0, left: 0 });
    };

    const handleCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        elementRef.current?.focus(); // Keep focus after command
    };

    return (
        <>
            {toolbarState.show && <TextToolbar position={toolbarState} onCommand={handleCommand} />}
            {React.createElement(tagName, {
                ref: elementRef,
                className,
                style,
                contentEditable: true,
                suppressContentEditableWarning: true,
                onMouseUp: handleMouseUp,
                onBlur: handleBlur,
                dangerouslySetInnerHTML: { __html: html },
            })}
        </>
    );
};

export default Editable;