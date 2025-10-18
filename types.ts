export interface SlideContent {
  title: string;
  content: string[];
  imagePrompt: string;
  imageUrl?: string;
}

export interface CarouselData {
  slides: SlideContent[];
}
