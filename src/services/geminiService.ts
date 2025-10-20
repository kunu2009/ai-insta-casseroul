import { GoogleGenAI, Modality } from "@google/genai";
import { SlideContent, ImageGenOptions, Idea, HashtagGroup, BioDetails, ReelScript, CaptionTone, ReelVibe } from '../types';

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
      - "imagePrompt": A descriptive prompt for an AI to generate a visually appealing image, or a 2-3 word search query for a stock photo service (e.g., "minimalist workspace", "abstract gradient").`;
      
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

export const generateCaptions = async (topic: string, tone: CaptionTone, apiKey: string): Promise<string[]> => {
  const ai = getAiClient(apiKey);

  try {
    const prompt = `
      Based on the following Instagram post description, generate 3 distinct and engaging caption options.
      The tone of the captions must be **${tone}**.

      Post Description:
      ---
      ${topic}
      ---

      Instructions for each caption:
      1. Start with a strong, scroll-stopping hook that matches the ${tone} tone.
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
        systemInstruction: "You are a world-class Instagram copywriter who communicates exclusively in valid JSON format. Your sole purpose is to generate compelling captions for posts based on the description and tone provided.",
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

export const generateProfileBios = async (details: BioDetails, apiKey: string): Promise<string[]> => {
  const ai = getAiClient(apiKey);
  try {
    const prompt = `
      Generate 3-5 distinct and compelling Instagram bio options based on the following details.
      Each bio must be under 150 characters.

      Details:
      - Name/Brand: ${details.name}
      - Niche/Role: ${details.niche}
      - Call to Action: ${details.cta}
      - Tone: ${details.tone}
      ${details.keywords ? `- Important Keywords to include: ${details.keywords}` : ''}

      Instructions for each bio:
      1. Clearly state who the person is and what they do.
      2. Incorporate the call to action naturally.
      3. Use line breaks (\\n) for readability.
      4. Use relevant emojis to add personality and break up text.
      5. Tailor the language to the specified tone.
      ${details.keywords ? '6. Weave in the provided keywords where it makes sense.' : ''}


      IMPORTANT: Respond with ONLY a valid JSON object. Do not include markdown, backticks, or any text outside of the JSON object.
      The JSON object must have a single root key "bios", which is an array of strings. Each string is a complete bio.
      Example format: { "bios": ["Bio 1...", "Bio 2...", "Bio 3..."] }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Instagram bio copywriter who communicates exclusively in valid JSON format. Your sole purpose is to generate optimized Instagram bios based on user-provided details.",
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("API response was empty.");
    }
    const match = text.trim().match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("Could not find a valid JSON object in the API response.");
    }

    const parsedData = JSON.parse(match[0]) as { bios: string[] };

    if (!parsedData.bios || !Array.isArray(parsedData.bios) || parsedData.bios.length === 0) {
      throw new Error("Invalid data structure in parsed JSON. Expected a 'bios' array.");
    }
    
    return parsedData.bios;
  } catch (error) {
    console.error("Error generating bios:", error);
    throw new Error(error instanceof Error ? `Failed to generate bios: ${error.message}` : "An unknown error occurred.");
  }
};

export const generateReelScript = async (topic: string, format: string, vibe: ReelVibe, apiKey: string): Promise<ReelScript> => {
    const ai = getAiClient(apiKey);
    try {
      const prompt = `
        Create a detailed script for an Instagram ${format} based on the topic: "${topic}".
        The overall vibe and mood of the video should be **${vibe}**.

        Instructions:
        1.  **Title:** A catchy, SEO-friendly title for the video.
        2.  **Hook:** A strong, attention-grabbing opening line or visual concept for the first 1-3 seconds, matching the ${vibe} mood.
        3.  **Scenes/Slides:**
            - For a Reel, provide 3-4 distinct scenes.
            - For a Story, provide 5 distinct slides.
            - For each scene/slide, detail three things: the "visual" (what the audience sees), the "script" (voiceover or dialogue), and the "onScreenText". All of these should reflect the ${vibe} vibe.
        4.  **CTA (Call to Action):** A clear and compelling call to action for the end of the video.

        IMPORTANT: Respond with ONLY a valid JSON object. Do not include markdown, backticks, or any text outside of the JSON object.
        The JSON object must have these exact keys: "title", "hook", "scenes", and "cta".
        - "scenes" must be an array of objects.
        - Each scene object must have these exact keys: "visual", "script", and "onScreenText".
        
        Example format for a scene object:
        { "visual": "A close-up shot of a steaming coffee cup.", "script": "Start your day the right way...", "onScreenText": "Morning Coffee Tip" }
      `;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional video content creator and scriptwriter for social media, communicating exclusively in valid JSON format. Your purpose is to generate structured scripts for Instagram Reels and Stories based on topic, format, and desired vibe.",
        },
      });
  
      const text = response.text;
      if (!text) {
          throw new Error("API response was empty.");
      }
      const match = text.trim().match(/\{[\s\S]*\}/);
      if (!match) {
          throw new Error("Could not find a valid JSON object in the API response.");
      }
  
      const parsedData = JSON.parse(match[0]) as ReelScript;
  
      if (!parsedData.title || !parsedData.hook || !parsedData.scenes || !Array.isArray(parsedData.scenes) || !parsedData.cta) {
        throw new Error("Invalid data structure in parsed JSON. Required keys are missing.");
      }
      
      return parsedData;
    } catch (error)
    {
      console.error("Error generating script:", error);
      throw new Error(error instanceof Error ? `Failed to generate script: ${error.message}` : "An unknown error occurred.");
    }
  };