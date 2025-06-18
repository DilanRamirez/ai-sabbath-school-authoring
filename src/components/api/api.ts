/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { WeekSchema } from "../../types/lesson-schema";
import type { LoginResponse } from "../../types/api";
import { generateDaySummaryPrompt } from "../../services/prompts";

const api = axios.create({
  // baseURL: "https://ai-sabbath-school-backend-production.up.railway.app/api/v1",
  baseURL: "http://0.0.0.0:8001/api/v1",
  // baseURL:
  //   "https://ai-sabbath-school-backend.mangomoss-c47d9f22.westus2.azurecontainerapps.io/api/v1",
});

export default api;

/**
 * Calls the backend login endpoint.
 */
// src/lib/api/auth.ts
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { access_token, token_type } = response.data;
    const token = `${token_type} ${access_token}`;
    localStorage.setItem("authToken", token);
    api.defaults.headers.common["Authorization"] = token;
    return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
}

/**
 * Uploads a PDF to the backend and returns the extracted Markdown.
 * @param file PDF file selected by the user
 * @returns the raw markdown string
 */
export async function parsePdf(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const token = localStorage.getItem("authToken");
  const response = await api.post<{ markdown: string }>(
    "/parser/llm/parser",
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: token } : {}),
      },
    }
  );

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
  // 1) build your prompt
  const promptPayload = {
    prompt: generateDaySummaryPrompt(lesson),
    mode: "summarize",
    lang: "es",
  };

  // 2) call the API
  const token = localStorage.getItem("authToken");
  const response = await api.post<{ response: string }>(
    "/prompt",
    promptPayload,
    { headers: token ? { Authorization: token } : {} }
  );

  // 3) strip any ```json / ``` fences
  let raw = response.data.response.trim();
  if (raw.startsWith("```")) {
    // remove opening fence
    raw = raw.substring(raw.indexOf("\n") + 1);
    // remove closing fence if present
    if (raw.endsWith("```")) {
      raw = raw.substring(0, raw.lastIndexOf("\n"));
    }
    raw = raw.trim();
  }

  // 4) try to parse it (once or twice)
  try {
    const parsed = JSON.parse(raw);

    // if it’s an object with a string “response” field, it might be doubly wrapped
    if (
      parsed &&
      typeof parsed === "object" &&
      "response" in parsed &&
      typeof (parsed as any).response === "string"
    ) {
      try {
        // parse the inner string
        const inner = JSON.parse((parsed as any).response);
        return inner;
      } catch {
        // not valid JSON inside, so just return the string
        return (parsed as any).response;
      }
    }

    // otherwise return the first parse
    return parsed.response || parsed;
  } catch (e) {
    // give up and return the raw string
    console.warn("generateDaySummary: failed to parse JSON:", raw, e);
    return { raw };
  }
}
