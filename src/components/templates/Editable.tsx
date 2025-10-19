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
    const [toolbarState, setToolbarState] = useState<{ show: boolean; top: number; left: number; placement: 'top' | 'bottom' }>({ show: false, top: 0, left: 0, placement: 'top' });
    const [activeStyles, setActiveStyles] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (elementRef.current && html !== elementRef.current.innerHTML) {
            elementRef.current.innerHTML = html;
        }
    }, [html]);

    const updateActiveStyles = () => {
        const styles: Record<string, boolean> = {};
        const commands = ['bold', 'italic', 'underline', 'strikeThrough', 'justifyLeft', 'justifyCenter', 'justifyRight'];
        commands.forEach(command => {
            styles[command] = document.queryCommandState(command);
        });

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            let node = selection.getRangeAt(0).startContainer;
            while (node && node !== elementRef.current) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;
                    if (element.style.textShadow) styles['textShadow'] = true;
                    if (element.style.webkitTextStroke) styles['textOutline'] = true;
                }
                node = node.parentNode!;
            }
        }
        setActiveStyles(styles);
    };

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const TOOLBAR_HEIGHT = 60; 

            const isSpaceAbove = rect.top > TOOLBAR_HEIGHT;
            
            setToolbarState({
                show: true,
                top: isSpaceAbove ? rect.top + window.scrollY : rect.bottom + window.scrollY,
                left: rect.left + window.scrollX + rect.width / 2,
                placement: isSpaceAbove ? 'top' : 'bottom'
            });
        } else {
            setToolbarState(prev => ({ ...prev, show: false }));
        }
        updateActiveStyles();
    };

    const handleKeyUp = () => {
        updateActiveStyles();
    };
    
    const handleBlur = () => {
        if (elementRef.current) {
            onChange(elementRef.current.innerHTML);
        }
        setTimeout(() => {
            if (document.activeElement !== elementRef.current) {
                setToolbarState({ show: false, top: 0, left: 0, placement: 'top' });
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
            default:
                document.execCommand(command, false, value);
                if (elementRef.current) {
                    onChange(elementRef.current.innerHTML);
                }
                break;
        }
        elementRef.current?.focus();
        setTimeout(updateActiveStyles, 0);
    };

    return (
        <>
            {toolbarState.show && <TextToolbar position={{top: toolbarState.top, left: toolbarState.left}} placement={toolbarState.placement} onCommand={handleCommand} activeStyles={activeStyles} />}
            {React.createElement(tagName, {
                ref: elementRef,
                className,
                style,
                contentEditable: true,
                suppressContentEditableWarning: true,
                onMouseUp: handleMouseUp,
                onKeyUp: handleKeyUp,
                onBlur: handleBlur,
                dangerouslySetInnerHTML: { __html: html },
            })}
        </>
    );
};

export default Editable;