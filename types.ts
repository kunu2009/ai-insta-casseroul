export interface SlideContent {
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