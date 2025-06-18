import type { WeekSchema } from "../types/lesson-schema";

export const generateDaySummaryPrompt = (lesson: WeekSchema) => {
  console.log("Generating prompt for lesson:", JSON.stringify(lesson, null, 2));
  return `
Eres un pedagogo y editor espiritual experto en Escuela Sabática. A partir del objeto JSON de entrada, para cada elemento del array "days":
1. Analiza \`rawMarkdown\` y \`sections\` para extraer el contexto real, sin inventar datos.
2. Usa \`day\` y conviértelo en "day".
3. Transforma \`date\` al formato "D de MMMM".
4. Genera "summary" sintetizando \`rawMarkdown\` y todo \`sections.paragraph\`.
5. Extrae 3–5 "keyPoints" relevantes basados en \`sections.paragraph\` y \`memory_verse\`.
6. Identifica términos especializados en \`rawMarkdown\` o \`sections\` y crea "glossary" con sus definiciones.
7. Construye "citations" incluyendo:
   - \`{ "reference": memory_verse.reference }\`
   - Para cada sección \`bible_question\`, usa su label o references.
8. En "teaching_guide":
   - "intro": breve introducción usando el primer párrafo de \`sections.paragraph\` o \`reflection\`.
   - "key_verse": el valor de \`memory_verse.reference\`.
   - "key_points": 2–4 objetos que incluyan:
     - "title": texto conciso del punto.
     - "explanation": explicación práctica basada en párrafos relacionados.
     - "content": cita o paráfrasis de \`rawMarkdown\`.
     - "illustration": sugiere un objeto visual y cómo usarlo en clase.
     - "discussion_questions": agrupa preguntas de \`sections.discussion_questions\` o \`reflection\`.
   - "mission_moment": usa contenido de cualquier \`quote\` o \`reflection\`.
   - "community_activity": sugiere una dinámica breve inspirada en \`sections\`.
   - "call_to_action": un llamado práctico al final.
   - "suggested_flow": organiza con:
     - "opening": bienvenida y oración.
     - "study_block": pasos para discusión de los key_points.
     - "application": actividad práctica.
     - "close": resumen y oración final.
9. Devuelve un array JSON con un objeto por cada día, en el mismo orden de "days".
10. No incluyas texto fuera del JSON ni inventes información; usa solo los datos de entrada.

--- ENTRADA (NO MODIFICAR) ---
${JSON.stringify(lesson, null, 2)}
--- FIN DE LA ENTRADA ---
`;
};
