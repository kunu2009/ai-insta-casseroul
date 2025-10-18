import { SlideContent } from '../../types';

export interface TemplateProps {
  slide: SlideContent;
  logo: string | null;
  onContentChange: (field: 'title' | 'content', value: string | string[]) => void;
}
