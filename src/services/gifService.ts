import GIF from 'gif.js';
import html2canvas from 'html2canvas';

interface GifGenerationOptions {
    slideElementIds: string[];
    delay: number; // in milliseconds
    onProgress: (progress: number) => void; // progress is 0 to 1
}

export const generateGif = (options: GifGenerationOptions): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const { slideElementIds, delay, onProgress } = options;
        
        const gif = new GIF({
            workers: 2,
            quality: 10, // lower is better
            workerScript: 'https://aistudiocdn.com/gif.js@^0.2.0/gif.worker.js',
            // Setting a transparent color can help with artifacts if slides have varying bg colors,
            // but might be unnecessary if all templates have solid backgrounds.
            // transparent: '#000000', 
        });

        for (let i = 0; i < slideElementIds.length; i++) {
            const slideId = slideElementIds[i];
            const element = document.getElementById(slideId) as HTMLElement;
            
            if (!element) {
                return reject(new Error(`Element with id ${slideId} not found.`));
            }
            
            try {
                const canvas = await html2canvas(element, {
                    allowTaint: true,
                    useCORS: true,
                    scale: 1.5, // Capture at 1.5x resolution for better quality
                    backgroundColor: '#1f2937', // Ensure consistent background for transparent elements
                });
                gif.addFrame(canvas, { delay });
                onProgress((i + 1) / slideElementIds.length);
            } catch (error) {
                console.error("Error capturing slide with html2canvas:", error);
                return reject(error);
            }
        }

        gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            resolve(url);
        });

        gif.render();
    });
};
