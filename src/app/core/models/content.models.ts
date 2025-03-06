  export type ContentType = 'book' | 'course' | 'study' | 'quiz' | 'article' | 'video';
  export type ContentStatus = 'draft' | 'published' | 'archived'|'review' | 'comingSoon';
  export type ContentCategory = 'spiritual' | 'technical' | 'study' | 'other';
  export type SectionType = 'default' | 'question' |'verse' | 'note' | 'intro' | 'textOnly' | 'videoNText' ;
  export type SubSectionType = 'default' | 'intro' | 'question' | 'cover' | 'verse' | 'note' | 'divider' | 'quote' | 'image' | 'carousel' | 'video';

export interface ContentCollection {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  items: ContentItem[];
}

export interface ContentItem {
  id: string;
  title: string;  
  description: string;
  status: ContentStatus;
  categoryKey: string;
  type: ContentType;
  language: string;
  coverImage: string;
  zipUrl: string;
  authors: Author[];
  version: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  audios_path: string;
  multiAuthorCommentary?: boolean;
}


export interface ContentMetadata extends ContentItem{
    partsMetadata: PartMetadata[];
  }

  export interface Author {
    id: string;
    name: string;
    image: string;
    bio: string;
    website: string;
    authorKey: string;

  }

  export interface PartMetadata {
    id: number;
    title: string;
    description: string;
    sectionCount: number;
    tags?: string[];    
    sectionMetadata?: SectionMetadata[];
  }

  export interface SectionMetadata {
    id: number;
    title: string;
    type: SectionType;
  }


  export interface Part extends PartMetadata { 
    contentId?: string;
    sections: Section[];    
  }

  export interface Section {
    id: string;
    title: string;
    type: SectionType;
    content: string;
    passage?: string;
    meaning?: string;
    commentary?: string;
    wordMeanings?: string;
    tags?: string[];
    subsections: Subsection[];
    images?: string[];
  }

  export interface Subsection {
    id: string;
    title: string;
    content: string;
    images?: string[];
    tags?: string[];
  }


  export interface UserProgress {
    currentPart: number;
    lastPosition: number;
    bookmarks: Bookmark[];
    lastRead: Date;
  }

  export interface UserPreferences {
    theme: 'light' | 'dark' | 'sepia';
    fontSize: number;
    lineSpacing: number;
    fontFamily: string;
  }

  export interface Bookmark {
    id: string;
    title: string;
    language: string;
    imageUrl: string;
    categoryKey: string;
    contentId: string;
    partId: number;
    sectionId: string;
    subsectionId: string;
    timestamp: Date;
    note?: string;
  } 



  // create a sample json list of authors
  


