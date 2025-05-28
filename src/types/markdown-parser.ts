export interface MarkdownBlock {
  id: string;
  content: string;
  type:
    | "heading"
    | "paragraph"
    | "bold"
    | "italic"
    | "list"
    | "quote"
    | "unknown";
  level?: number; // For headings (1-6)
  originalIndex: number;
  isAssigned: boolean;
  assignedDay?: string;
  assignedSectionType?: string;
  metadata?: {
    isBold?: boolean;
    isItalic?: boolean;
    isDate?: boolean;
    isMemoryVerse?: boolean;
    isQuestion?: boolean;
    isQuote?: boolean;
  };
}

export interface SplitMarker {
  position: number;
  type: "heading" | "manual";
  content: string;
}

export interface ParsedStructure {
  blocks: MarkdownBlock[];
  headings: Array<{
    level: number;
    text: string;
    position: number;
  }>;
  potentialSections: Array<{
    type: string;
    blocks: MarkdownBlock[];
    confidence: number;
  }>;
}
