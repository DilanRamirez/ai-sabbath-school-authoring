/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WeekSchema } from "../types/lesson-schema";

export interface ParsedSection {
  title: string;
  content: string;
  level: number;
  originalIndex: number;
}

export function parseMarkdownByHeadings(markdown: string): ParsedSection[] {
  const lines = markdown.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{2,3})\s+\*{0,2}(.+?)\*{0,2}$/);

    if (headingMatch) {
      // Save the previous section before starting a new one
      if (currentSection) {
        currentSection.content = currentContent
          .join("\n")
          .replace(/\n(?!\n)/g, " ")
          .trim();
        sections.push(currentSection);
      }

      const level = headingMatch[1].length;
      const title = headingMatch[2].replace(/\*\*/g, "").trim();

      currentSection = {
        title,
        content: "",
        level,
        originalIndex: i,
      };
      currentContent = [];
    } else {
      // Accumulate content under the current section
      if (currentSection) {
        currentContent.push(line);
      }
    }
  }

  // Push the last section if exists
  if (currentSection) {
    currentSection.content = currentContent
      .join("\n")
      .replace(/\n(?!\n)/g, " ")
      .trim();
    sections.push(currentSection);
  }

  return sections;
}

export function detectDayFromContent(index: number): string {
  const days: string[] = [
    "Sábado", // 0
    "Domingo", // 1
    "Lunes", // 2
    "Martes", // 3
    "Miércoles", // 4
    "Jueves", // 5
    "Viernes", // 6
  ];

  return days[index] || "";
}

export function extractDateFromContent(content: string): string {
  // Look for date patterns like "17 de mayo", "May 17", etc.
  const datePatterns = [
    /(\d{1,2})\s+de\s+(\w+)/i, // Spanish: "17 de mayo"
    /(\w+)\s+(\d{1,2})/i, // English: "May 17"
    /(\d{4}-\d{2}-\d{2})/, // ISO format: "2025-05-17"
  ];

  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return "";
}

export function sanitizeWeekData(data: WeekSchema): WeekSchema {
  const cleanDays = data.days.map((day) => ({
    ...day,
    sections: day.sections?.map((section) => {
      const { type } = section;
      if (type === "paragraph") {
        return { type, content: section.content };
      }
      if (type === "bible_question") {
        return { type, label: section.label, question: section.question };
      }
      if (type === "quote") {
        return {
          type,
          author: section.author,
          source: section.source,
          content: section.content,
        };
      }
      if (type === "reading") {
        return { type, label: section.label, references: section.references };
      }
      if (type === "memory_verse") {
        return { type, label: section.label, content: section.content };
      }
      if (type === "discussion_questions") {
        return { type, questions: section.questions };
      }
      return section;
    }),
  }));

  return { ...data, days: cleanDays };
}

export function cleanMarkdownText(text: string | undefined): string {
  return (text || "")
    .replace(/[#*_`~>-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeWeekDataDownload(data: WeekSchema): WeekSchema {
  const cleanDays = data.days.map((day) => ({
    ...day,
    title: cleanMarkdownText(day.title),
    sections: day.sections?.map((section) => {
      const { type } = section;
      if (type === "paragraph") {
        return { type, content: cleanMarkdownText((section as any).content) };
      }
      if (type === "bible_question") {
        return {
          type,
          label: cleanMarkdownText((section as any).label),
          question: cleanMarkdownText((section as any).question),
        };
      }
      if (type === "quote") {
        return {
          type,
          author: cleanMarkdownText((section as any).author),
          source: cleanMarkdownText((section as any).source),
          content: cleanMarkdownText((section as any).content),
        };
      }
      if (type === "reading") {
        return {
          type,
          label: cleanMarkdownText((section as any).label),
          references: (section as any).references?.map(cleanMarkdownText),
        };
      }
      if (type === "memory_verse") {
        return {
          type,
          label: cleanMarkdownText((section as any).label),
          content: cleanMarkdownText((section as any).content),
        };
      }
      if (type === "discussion_questions") {
        return {
          type,
          questions: (section as any).questions?.map(cleanMarkdownText),
        };
      }
      return section;
    }),
  }));
  return { ...data, days: cleanDays };
}
