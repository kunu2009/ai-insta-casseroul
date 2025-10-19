import { GoogleGenAI, Modality } from "@google/genai";
import { SlideContent } from '../types';

// Re-introduce getAiClient to handle user-provided API keys.
const getAiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in settings.");
  }
  return new GoogleGenAI({ apiKey });
};

// Add apiKey parameter
export const generateCarouselContent = async (topic: string, apiKey: string): Promise<SlideContent[]> => {
  const ai = getAiClient(apiKey);
  try {
    const prompt = `
      Generate a 3-5 slide Instagram carousel script based on the topic: "${topic}".
      The first slide should be a strong hook, the last a call to action.

      IMPORTANT: Respond with ONLY a valid JSON object. Do not include markdown, backticks, or any text outside of the JSON object.
      The JSON object must have a single root key "slides", which is an array of slide objects.
      Each slide object must have these exact keys: "title", "content", "imagePrompt".
      - "title": A short, catchy title (max 10 words). The HTML for this can be a simple string.
      - "content": An array of 2-4 strings, each a key point (max 25 words per string). The HTML for these can be simple strings.
      - "imagePrompt": A descriptive prompt for an AI to generate a minimalist, visually appealing background image.`;
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert social media strategist who communicates exclusively in valid JSON format. Your sole purpose is to generate Instagram carousel scripts based on user topics. You will always return a single JSON object with a 'slides' array, and no other text or explanation.",
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Invalid structure received from API. API response was empty.");
    }
    const jsonText = text.trim();
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("Invalid structure received from API. Could not find a JSON object.");
    }

    const parsedData = JSON.parse(match[0]) as { slides: Omit<SlideContent, 'imageUrls' | 'selectedImageIndex'>[] };

    if (!parsedData.slides || !Array.isArray(parsedData.slides)) {
      throw new Error("Invalid data structure in parsed JSON.");
    }
    
    return parsedData.slides.map(slide => ({
      ...slide,
      content: slide.content.map(c => String(c)), // Ensure content items are strings
      imageUrls: [],
      selectedImageIndex: -1,
    }));
  } catch (error) {
    console.error("Error generating carousel content:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate carousel: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating carousel content.");
  }
};

// Add apiKey parameter
export const generateImageFromPrompt = async (prompt: string, apiKey: string): Promise<string> => {
  const ai = getAiClient(apiKey);
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A vibrant, minimalist, and aesthetically pleasing graphic for an Instagram carousel slide. The graphic should visually represent the concept: "${prompt}". Use a clean and modern style.` }]
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
    });

    const parts = response.candidates?.[0]?.content?.parts;

    if (parts) {
        for (const part of parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
          }
        }
    }
    
    throw new Error("No image was generated or image data is missing.");

  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
        if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
             throw new Error("API rate limit exceeded. Please wait a moment before trying to generate more images.");
        }
        if (error.message.includes('billing required') || error.message.includes('billing-enabled')) {
            throw new Error("Image generation failed. This model may require a billing-enabled Google Cloud project.");
        }
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};