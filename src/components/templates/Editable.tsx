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
        // Delay hiding to allow toolbar clicks to register
        setTimeout(() => {
            if (document.activeElement !== elementRef.current) {
                setToolbarState({ show: false, top: 0, left: 0 });
            }
        }, 150);
    };

    const toggleSpanStyle = (style: Partial<CSSStyleDeclaration>) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        let parentElement: Node | null = range.commonAncestorContainer;
        if (parentElement.nodeType !== 1) {
            parentElement = parentElement.parentNode;
        }

        if (!parentElement) {
            return;
        }

        const styleKey = Object.keys(style)[0] as keyof CSSStyleDeclaration;
        
        if (parentElement.nodeName === 'SPAN' && (parentElement as HTMLElement).style[styleKey]) {
            const span = parentElement as HTMLSpanElement;
            const grandParent = span.parentNode;
            if (grandParent) {
                while (span.firstChild) {
                    grandParent.insertBefore(span.firstChild, span);
                }
                grandParent.removeChild(span);
            }
        } else {
            const span = document.createElement('span');
            Object.assign(span.style, style);
            try {
                span.appendChild(range.extractContents());
                range.insertNode(span);
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                selection.addRange(newRange);
            } catch (e) {
                console.error("Failed to wrap selection", e);
            }
        }
        onChange(elementRef.current?.innerHTML || '');
    };

    const handleCommand = (command: string, value?: string) => {
        switch (command) {
            case 'textShadow':
                toggleSpanStyle({ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' });
                break;
            case 'textOutline':
                toggleSpanStyle({ webkitTextStroke: '1px black' });
                break;
            case 'strikeThrough':
                 document.execCommand('strikeThrough', false, value);
                 break;
            default:
                document.execCommand(command, false, value);
                break;
        }
        elementRef.current?.focus();
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