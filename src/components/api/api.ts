import axios from "axios";
import type { WeekSchema } from "../../types/lesson-schema";
import { generateDaySummaryPrompt } from "../../services/prompts";

const api = axios.create({
  // baseURL: "https://ai-sabbath-school-backend-production.up.railway.app/api/v1",
  baseURL: "http://0.0.0.0:8001/api/v1",
});

export default api;

/**
 * Uploads a PDF to the backend and returns the extracted Markdown.
 * @param file PDF file selected by the user
 * @returns the raw markdown string
 */
export async function parsePdf(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const response = await api.post<{ markdown: string }>("/llm/parser", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.markdown;
}

/**
 * Imports a cleaned lesson JSON and its PDF into the backend.
 * @param year e.g. "2025"
 * @param quarter e.g. "Q2"
 * @param lessonNumber e.g. "8"
 * @param lessonData fully formed lesson object conforming to your schema
 * @param pdfFile the original PDF file for this lesson
 */
export async function importLesson(
  year: string,
  quarter: string,
  lessonNumber: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lessonData: any,
  pdfFile: File
): Promise<{ status: string; message: string }> {
  const form = new FormData();
  // lesson_data must be a JSON-encoded string
  form.append("lesson_data", JSON.stringify(lessonData));
  form.append("pdf", pdfFile);

  // Extract and append metadata
  const {
    id,
    lesson_number,
    title,
    quarter: qtr,
    year: yr,
    week_range,
    memory_verse,
  } = lessonData;
  const metadata = {
    id,
    lesson_number,
    title,
    quarter: qtr,
    year: yr,
    week_range,
    memory_verse,
  };
  form.append("metadata", JSON.stringify(metadata));

  console.log("Importing lesson with metadata:", metadata);

  const endpoint = `/lessons/${year}/${quarter}/lesson-${lessonNumber}/import`;
  const response = await api.post<{ status: string; message: string }>(
    endpoint,
    form
  );

  return response.data;
}

/**
 * Generates detailed day-by-day summaries for a lesson via the LLM.
 * @param lesson - The full lesson object matching WeekSchema.
 * @returns The generated summary text from the LLM.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateDaySummary(lesson: WeekSchema): Promise<any> {
  // Construct a descriptive prompt for day-by-day summaries
  const promptPayload = {
    prompt: generateDaySummaryPrompt(lesson),
    mode: "summarize",
    lang: "es",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await api.post<{ response: string }>(
    "/prompt",
    promptPayload
  );
  // Strip Markdown JSON code fences if present
  let raw: string = response.data.response;
  raw = raw.replace(/```json\s*/, "").replace(/\s*```$/, "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn("Failed to parse JSON, returning raw response.");
    parsed = raw;
  }
  console.log("Generated summary:", parsed);
  return parsed;
}
