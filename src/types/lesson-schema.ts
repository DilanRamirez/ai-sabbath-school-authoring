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
  reference?: string;
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

export interface ReflectionSection {
  type: "reflection";
  references?: string;
  content?: string;
}
export type Section =
  | ReadingSection
  | MemoryVerseSection
  | ParagraphSection
  | BibleQuestionSection
  | QuoteSection
  | DiscussionQuestionsSection
  | ReflectionSection;

export type DayType = "introduction" | "devotional" | "review";

export interface MemoryVerse {
  text: string;
  reference: string;
}

export interface WeekRange {
  start: string;
  end: string;
}

export interface Day {
  day: string;
  date: string;
  type: DayType;
  title: string;
  sections: Section[];
  daySummary?: DaySummary; // Optional summary for the day
  rawMarkdown?: string;
}

export interface WeekSchema {
  id: string;
  quarter: string;
  year: string;
  lesson_number: number;
  title: string;
  week_range: WeekRange;
  memory_verse: MemoryVerse;
  days: Day[];
}

// Interface representing a single day in the lesson
export interface LessonDay {
  day: string;
  date: string;
  type: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sections: any[]; // Adjust as needed for your sections shape
}

// Interface representing the entire lesson structure
export interface LessonData {
  id: string;
  lesson_number: number;
  title: string;
  quarter: string;
  year: number;
  week_range: { start: string; end: string };
  memory_verse: { text: string; reference: string };
  days: LessonDay[];
}

// Interface for the summary structure returned by the LLM
export interface DaySummary {
  day: string;
  date: string;
  summary: string;
  keyPoints: string[];
  glossary: Record<string, string>;
  citations: { reference: string }[];
  teachingGuide: TeachingGuide; // Detalles para guiar la enseñanza del día
}

export interface TeachingGuide {
  intro: string; // Breve introducción espiritual al tema del día
  key_verse?: string; // Texto bíblico clave que resume el enfoque del día

  key_points: KeyPoint[]; // Lista de puntos clave que se desarrollan en la clase

  mission_moment?: string; // Historia o testimonio para inspirar misión
  community_activity?: string; // Dinámica grupal para fomentar compañerismo
  call_to_action: string; // Llamado a aplicar el mensaje espiritualmente

  suggested_flow?: {
    opening: string; // Cómo iniciar la clase
    study_block: string; // Cómo desarrollar el estudio principal
    application: string; // Cómo conectar el contenido con la vida diaria
    close: string; // Cómo cerrar con oración y reflexión
  };
}

export interface KeyPoint {
  title: string; // Título del punto clave
  explanation: string; // Cómo explicarlo de forma clara al grupo
  content: string; // Fragmento o idea original de la lección relacionado
  illustration?: {
    title: string; // Título o nombre del ejemplo visual
    description: string; // Cómo se usa en la clase para ilustrar el punto
  };
  discussion_questions: string[]; // Preguntas específicas relacionadas con este punto
}
