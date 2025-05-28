import type { WeekSchema } from "../types/lesson-schema";

// Mock API service to replace Next.js API routes
export const mockApiService = {
  async submitLesson(weekData: WeekSchema) {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate validation
    if (!weekData.title) {
      throw new Error("Lesson title is required");
    }

    if (!weekData.week_range.start || !weekData.week_range.end) {
      throw new Error("Week start and end dates are required");
    }

    if (!weekData.memory_verse.text || !weekData.memory_verse.reference) {
      throw new Error("Memory verse text and reference are required");
    }

    if (weekData.days.length !== 7) {
      throw new Error("Exactly 7 days are required");
    }

    // Validate each day
    for (let i = 0; i < weekData.days.length; i++) {
      const day = weekData.days[i];
      if (!day.date || !day.title) {
        throw new Error(
          `Day ${i + 1} is missing required fields (date, title)`
        );
      }
    }

    console.log("Received week schema:", {
      id: weekData.id,
      lesson_number: weekData.lesson_number,
      title: weekData.title,
      total_days: weekData.days.length,
      total_sections: weekData.days.reduce(
        (sum, day) => sum + day.sections.length,
        0
      ),
    });

    return {
      success: true,
      message: `Lesson ${weekData.lesson_number} "${weekData.title}" submitted successfully`,
      id: weekData.id,
      lesson_number: weekData.lesson_number,
      processed_days: weekData.days.length,
      processed_sections: weekData.days.reduce(
        (sum, day) => sum + day.sections.length,
        0
      ),
      timestamp: new Date().toISOString(),
    };
  },

  async convertPdfToMarkdown(file: File) {
    // Simulate PDF processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!file.name.endsWith(".pdf")) {
      throw new Error("Only PDF files are supported");
    }

    const mockMarkdownContent = `**Lección 8** : Para el 24 de mayo de 2025
## **EN LOS SALMOS - PRIMERA ** **PARTE**

Sábado 17 de mayo

**LEE PARA EL ESTUDIO DE ESTA SEMANA:** Hebreos 9:11-15; Salmos 122; Salmos
15; Salmos 24; Éxodo 33:18-23; Salmos 5; Salmos 51:7-15.

**PARA MEMORIZAR:**

"Entonces miré y vi al Cordero de pie sobre el monte Sion, y con él ciento cuarenta
y cuatro mil que tenían el nombre del Cordero y el nombre de su Padre escrito en
sus frentes" (Apoc. 14:1).

// ... rest of the lesson content would be here`;

    return {
      success: true,
      filename: file.name,
      originalSize: file.size,
      markdown: mockMarkdownContent,
      processingTime: 2000,
      extractedSections: {
        title: "EN LOS SALMOS - PRIMERA PARTE",
        lessonNumber: 8,
        memoryVerse:
          "Entonces miré y vi al Cordero de pie sobre el monte Sion...",
        memoryReference: "Apoc. 14:1",
        readingReferences: [
          "Hebreos 9:11-15",
          "Salmos 122",
          "Salmos 15",
          "Salmos 24",
          "Éxodo 33:18-23",
          "Salmos 5",
          "Salmos 51:7-15",
        ],
        detectedDays: [
          "Sábado",
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
        ],
      },
      message: "PDF successfully converted to Markdown",
    };
  },
};
