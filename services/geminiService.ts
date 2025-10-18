import { GoogleGenAI, Type } from "@google/genai";
import { CarouselData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const carouselSchema = {
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      description: "An array of 5 to 7 carousel slides.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A short, catchy title for the slide (max 10 words). This is the main hook.",
          },
          content: {
            type: Type.ARRAY,
            description: "A list of 2-4 key points or a short paragraph for the slide body (max 25 words per item).",
            items: {
              type: Type.STRING,
            },
          },
          imagePrompt: {
            type: Type.STRING,
            description: "A simple, descriptive prompt for an AI image generator to create a relevant, visually appealing, and minimalist background for this slide.",
          },
        },
        required: ["title", "content", "imagePrompt"],
      },
    },
  },
  required: ["slides"],
};

export const generateCarouselContent = async (topic: string): Promise<CarouselData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a 5-7 slide Instagram carousel script based on the following topic: "${topic}". Each slide should be optimized for readability and engagement. The first slide should be a strong hook, and the last should be a call to action.`,
      config: {
        systemInstruction: "You are an expert social media strategist specializing in creating engaging Instagram carousels. Your goal is to transform user-provided topics or text into a concise, visually compelling, and easy-to-digest carousel format. Ensure the tone is inspiring and informative.",
        responseMimeType: "application/json",
        responseSchema: carouselSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText) as CarouselData;

    if (!parsedData.slides || !Array.isArray(parsedData.slides)) {
      throw new Error("Invalid data structure received from API.");
    }
    
    return parsedData;
  } catch (error) {
    console.error("Error generating carousel content:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate carousel: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating carousel content.");
  }
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A vibrant, minimalist, and aesthetically pleasing graphic for an Instagram carousel slide. The graphic should visually represent the concept: "${prompt}". Use a clean and modern style.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("No image was generated.");
    }
    
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;

  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};
