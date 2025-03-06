import { Part, Section } from "../../../core/models/content.models";

import { ContentMetadata } from "../../../core/models/content.models";

export interface ReaderState {
  metadata: ContentMetadata | null;
  currentPart: Part | null;
  currentSection: Section | null;
  currentSectionIndex: number;
  isLoading: boolean;
  isSidebarCollapsed: boolean;
  isBookmarked: boolean;
  passageLines: string[];
} 

export interface Commentary {
  verseNum: string;
  explanation: string;
}

