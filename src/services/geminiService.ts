import { GoogleGenAI, Modality } from "@google/genai";
import { SlideContent, ImageGenOptions, Idea, HashtagGroup } from '../types';

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
      The JSON object must have a single root key "slides", which is an an array of slide objects.
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

    const parsedData = JSON.parse(match[0]) as { slides: Omit<SlideContent, 'id' | 'imageUrls' | 'selectedImageIndex'>[] };

    if (!parsedData.slides || !Array.isArray(parsedData.slides)) {
      throw new Error("Invalid data structure in parsed JSON.");
    }
    
    return parsedData.slides.map((slide, index) => ({
      ...slide,
      id: `slide_${Date.now()}_${index}`,
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

export const generateImageFromPrompt = async (
  slide: Pick<SlideContent, 'title' | 'content' | 'imagePrompt'>,
  options: ImageGenOptions,
  apiKey: string
): Promise<string> => {
  const ai = getAiClient(apiKey);
  try {
    const detailedPrompt = `
      Create a visually stunning, high-quality background image for an Instagram carousel slide.

      **STYLE & VISUAL INSTRUCTIONS:**
      - **Visual Style:** ${options.style}.
      - **Aspect Ratio:** ${options.aspectRatio}.
      ${options.colorPalette ? `- **Color Palette:** Use colors inspired by "${options.colorPalette}".` : ''}
      - **Composition:** The image must be minimalist, modern, and aesthetically pleasing, suitable for text overlay. Avoid clutter.

      **CONTENT CONTEXT:**
      The overall theme of the slide is: "${slide.title}"
      The key messages on the slide are:
      - ${slide.content.join('\n- ')}

      **IMAGE SUBJECT:**
      Based on all the context above, generate an image that visually represents the core concept of: "${slide.imagePrompt}"

      **CRITICAL INSTRUCTIONS:**
      1.  **DO NOT include any text, letters, or numbers in the image.** The image must be purely graphical.
      2.  The style should be abstract and metaphorical, not always a literal depiction, unless 'Photorealistic' is specified.
      3.  The final output must be a single, cohesive image.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: detailedPrompt }]
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
    });

    const parts = response.candidates?.[0]?.content?.parts;

    if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data && part.inlineData.mimeType) {
            const base64ImageBytes = part.inlineData.data;
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

export const generateCaptions = async (topic: string, apiKey: string): Promise<string[]> => {
  const ai = getAiClient(apiKey);

  try {
    const prompt = `
      Based on the following Instagram post description, generate 3 distinct and engaging caption options.

      Post Description:
      ---
      ${topic}
      ---

      Instructions for each caption:
      1. Start with a strong, scroll-stopping hook.
      2. Elaborate on the user's description to create a compelling narrative.
      3. End with a clear call-to-action (e.g., asking a question, encouraging saves/shares).
      4. Include 3-5 relevant, niche hashtags.
      5. Use emojis appropriately to enhance readability and engagement.

      IMPORTANT: Respond with ONLY a valid JSON object. Do not include markdown, backticks, or any text outside of the JSON object.
      The JSON object must have a single root key "captions", which is an array of 3 strings. Each string is a complete caption.
      Example format: { "captions": ["Caption 1...", "Caption 2...", "Caption 3..."] }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class Instagram copywriter who communicates exclusively in valid JSON format. Your sole purpose is to generate compelling captions for posts based on the description provided.",
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

    const parsedData = JSON.parse(match[0]) as { captions: string[] };

    if (!parsedData.captions || !Array.isArray(parsedData.captions) || parsedData.captions.length === 0) {
      throw new Error("Invalid data structure in parsed JSON. Expected 'captions' array.");
    }
    
    return parsedData.captions;
  } catch (error) {
    console.error("Error generating captions:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate captions: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating captions.");
  }
};

export const generateIdeas = async (niche: string, apiKey: string): Promise<Idea[]> => {
  const ai = getAiClient(apiKey);
  try {
    const prompt = `
      Brainstorm 5-7 engaging Instagram post ideas for the niche: "${niche}".
      For each idea, provide a catchy title/hook and a brief description of the content.

      IMPORTANT: Respond with ONLY a valid JSON object. Do not include markdown, backticks, or any text outside of the JSON object.
      The JSON object must have a single root key "ideas", which is an array of objects.
      Each object must have these exact keys: "title" and "description".
      - "title": A scroll-stopping hook or title for the post.
      - "description": A short, 1-2 sentence description of what the post would be about (e.g., a carousel, reel, or single image post).
      Example format: { "ideas": [{ "title": "...", "description": "..." }] }
    `;
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a creative social media content strategist who communicates exclusively in valid JSON format. Your sole purpose is to brainstorm engaging Instagram post ideas based on a user's niche.",
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

    const parsedData = JSON.parse(match[0]) as { ideas: Idea[] };

    if (!parsedData.ideas || !Array.isArray(parsedData.ideas) || parsedData.ideas.length === 0) {
      throw new Error("Invalid data structure in parsed JSON. Expected 'ideas' array.");
    }
    
    return parsedData.ideas;
  } catch (error) {
    console.error("Error generating ideas:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate ideas: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating ideas.");
  }
};


export const generateHashtags = async (topic: string, apiKey: string): Promise<HashtagGroup[]> => {
  const ai = getAiClient(apiKey);
  try {
    const prompt = `
      Generate 3 strategic groups of Instagram hashtags for a post about: "${topic}".
      The groups should be "Broad", "Niche", and "Community".
      - "Broad" hashtags have high volume and reach a wide audience (e.g., #socialmedia).
      - "Niche" hashtags are more specific to the topic (e.g., #contentstrategy).
      - "Community" hashtags are used by specific communities or for challenges (e.g., #socialmediatipsandtricks).
      Provide 5-7 hashtags for each category.

      IMPORTANT: Respond with ONLY a valid JSON object. Do not include markdown, backticks, or any text outside of the JSON object.
      The JSON object must have a single root key "hashtagGroups", which is an array of objects.
      Each object must have these exact keys: "category" and "hashtags" (an array of strings).
      Example format: { "hashtagGroups": [{ "category": "Broad", "hashtags": ["#...", "#..."] }, ...] }
    `;
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Instagram marketing strategist who communicates exclusively in valid JSON format. Your sole purpose is to generate categorized groups of relevant hashtags based on a user's topic.",
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

    const parsedData = JSON.parse(match[0]) as { hashtagGroups: HashtagGroup[] };

    if (!parsedData.hashtagGroups || !Array.isArray(parsedData.hashtagGroups) || parsedData.hashtagGroups.length === 0) {
      throw new Error("Invalid data structure in parsed JSON. Expected 'hashtagGroups' array.");
    }
    
    return parsedData.hashtagGroups;
  } catch (error) {
    console.error("Error generating hashtags:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate hashtags: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating hashtags.");
  }
};