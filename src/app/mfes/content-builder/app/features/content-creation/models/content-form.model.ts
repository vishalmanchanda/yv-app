import { Author, ContentCategory, PartMetadata } from "../../../../../../core/models/content.models";
import { ContentType } from "../../../../../../core/models/content.models";


export interface ContentFormData {
  title: string;
  description: string;
  type: ContentType;
  categoryKey: string;
  category: ContentCategory;
  language: string;
  keywords: string;
  authors: Author[];
  systemPrompt?: string;
  userPrompt?: string;
  coverImage?: string;
  zipUrl?: string;
  partsMetadata?: PartMetadata[];
}

export enum ContentFormTab {
  SIMPLE = 'simple',
  AI_ASSISTED = 'ai-assisted',
  PROMPT_EDITOR = 'prompt-editor'
} 