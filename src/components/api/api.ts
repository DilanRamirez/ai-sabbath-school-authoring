import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-sabbath-school-backend-production.up.railway.app/api/v1",
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
 * @param lessonId e.g. "lesson-08"
 * @param lessonData fully formed lesson object conforming to your schema
 * @param pdfFile the original PDF file for this lesson
 */
export async function importLesson(
  year: string,
  quarter: string,
  lessonId: string,
  lessonData: unknown,
  pdfFile: File
): Promise<{ status: string; message: string }> {
  const form = new FormData();
  // lesson_data must be a JSON-encoded string
  form.append("lesson_data", JSON.stringify(lessonData));
  form.append("pdf", pdfFile);

  const endpoint = `/lessons/${year}/${quarter}/${lessonId}/import`;
  const response = await api.post<{ status: string; message: string }>(
    endpoint,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
}
