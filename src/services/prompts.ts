import type { WeekSchema } from "../types/lesson-schema";

export const generateDaySummaryPrompt = (lesson: WeekSchema) => {
  return `Eres un experto pedagogo y editor espiritual de la App Interactiva de Escuela Sabática. Tu tarea es tomar como entrada un objeto JSON que describe una lección semanal (con metadatos de título, rango de fechas, versículo de memoria y un arreglo de días con su contenido) y, para cada día (sábado a viernes), generar un resumen DESEMPAQUETADO y detallado que sirva como introducción a la sección diaria.

Devuelve la salida **únicamente** en **JSON** con la siguiente estructura:

[
  {
    "day": "<día>",               // Ej. "Sábado"
    "date": "<fecha>",            // Ej. "14 de junio"
    "summary": "<resumen general>", 
    "keyPoints": [
      "<punto clave 1>",
      "<punto clave 2>",
      "<punto clave 3>"
    ],
    "glossary": {
      "<término1>": "<definición corta>",
      "<término2>": "<definición corta>"
    },
    "citations": [
      {
        "reference": "<Libro capítulo:versículo>"
      },
      ...
    ]
  },
  ...
]

--- ENTRADA (NO MODIFICAR) ---  
${JSON.stringify(lesson, null, 2)}
--- FIN DE LA ENTRADA ---  

No envíes texto fuera del JSON; el cuerpo de la respuesta debe ser un JSON válido según el esquema arriba.

Para cada objeto dentro de '"days"', produce una salida con esta estructura exacta:

**Instrucciones adicionales:**  
- Usa el título y las secciones ('reading', 'memory_verse', 'paragraph', 'bible_question', 'reflection', 'discussion_questions') para inspirar el contenido del resumen.  
- Formatea la fecha en español, p. ej. “14 de junio”.  
- Asegúrate de que los términos del glosario aparezcan reflejados en el contenido (por ejemplo, “historicismo”, “precursores”, “marca de la bestia”, “ministerio laico”).  
- Para “Citas bíblicas”, extrae las referencias que aparecen en la sección 'memory_verse', en los 'bible_question' o en cualquier 'quote'.  
- No añadas secciones ni encabezados adicionales.  

Genera la sección de resumen para cada día en el mismo orden que aparecen en el JSON de entrada.`;
};
