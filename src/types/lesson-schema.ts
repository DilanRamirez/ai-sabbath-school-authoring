export type SectionType =
  | "reading"
  | "memory_verse"
  | "paragraph"
  | "bible_question"
  | "quote"
  | "discussion_questions";

export interface ReadingSection {
  type: "reading";
  label: string;
  references?: string[];
}

export interface MemoryVerseSection {
  type: "memory_verse";
  label: string;
  content?: string;
}

export interface ParagraphSection {
  type: "paragraph";
  content?: string;
}

export interface BibleQuestionSection {
  type: "bible_question";
  label: string;
  question: string;
}

export interface QuoteSection {
  type: "quote";
  author: string;
  source: string;
  content: string;
}

export interface DiscussionQuestionsSection {
  type: "discussion_questions";
  questions?: string[];
}

export type Section =
  | ReadingSection
  | MemoryVerseSection
  | ParagraphSection
  | BibleQuestionSection
  | QuoteSection
  | DiscussionQuestionsSection;

export type DayType = "introduction" | "devotional" | "review";

export interface Day {
  day: string;
  date: string;
  type: DayType;
  title: string;
  sections: Section[];
  rawMarkdown?: string;
}

export interface MemoryVerse {
  text: string;
  reference: string;
}

export interface WeekRange {
  start: string;
  end: string;
}

export interface WeekSchema {
  id: string;
  lesson_number: number;
  title: string;
  week_range: WeekRange;
  memory_verse: MemoryVerse;
  days: Day[];
}
