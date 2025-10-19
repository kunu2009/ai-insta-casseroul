export interface SlideContent {
  id: string;
  title: string;
  content: string[];
  imagePrompt: string;
  imageUrls: string[];
  selectedImageIndex: number;
}

export type TemplateId = 'minimalist' | 'bold' | 'dynamic' | 'elegant' | 'gradient' | 'editorial' | 'retro' | 'cinematic' | 'handwritten';

export interface CarouselData {
  slides: SlideContent[];
  templateId: TemplateId;
}

export type ImageAspectRatio = '1:1' | '9:16' | '16:9';
export type ImageStyle = 'Photorealistic' | 'Abstract' | 'Illustration' | 'Minimalist' | '3D Render' | 'Anime';

export interface ImageGenOptions {
  aspectRatio: ImageAspectRatio;
  style: ImageStyle;
  colorPalette?: string;
}

export interface Idea {
  title: string;
  description: string;
}

export interface HashtagGroup {
  category: string;
  hashtags: string[];
}