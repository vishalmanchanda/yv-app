import { Section } from '../../../core/models/content.models';

export interface ISectionViewComponent {
  section: Section;
  partId: string;
  onNavigate?: () => void;  
} 