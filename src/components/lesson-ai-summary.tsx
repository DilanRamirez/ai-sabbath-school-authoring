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
  general: string;
  keyPoints: string[];
  glossary: { term: string; definition: string }[];
  bibleQuotes: string[];
}

// Props for the new SummaryTab component
interface SummaryTabProps {
  lesson: WeekSchema;
  llmEndpoint: string;
}

import React, { useState, useCallback } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import type { WeekSchema } from "../types/lesson-schema";

const SummaryTab: React.FC<SummaryTabProps> = ({ lesson, llmEndpoint }) => {
  const [summaries, setSummaries] = useState<Record<string, DaySummary>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(llmEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      const data: Record<string, DaySummary> = await response.json();
      setSummaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [lesson, llmEndpoint]);

  return (
    <Box p={2}>
      <Box mb={2}>
        <Button
          variant="contained"
          onClick={generateSummaries}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            "Generar resumen de lección"
          )}
        </Button>
        {error && <Typography color="error">{error}</Typography>}
      </Box>
      {lesson.days.map((day) => {
        const summary = summaries[day.day];
        return (
          <Paper key={day.day} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{`${day.day} (${new Date(
              day.date
            ).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "long",
            })})`}</Typography>
            {summary ? (
              <>
                <Typography variant="subtitle1">Resumen general:</Typography>
                <Typography paragraph>{summary.general}</Typography>
                <Typography variant="subtitle1">Puntos clave:</Typography>
                <ul>
                  {summary.keyPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
                <Typography variant="subtitle1">
                  Glosario de términos:
                </Typography>
                <ul>
                  {summary.glossary.map((gl, idx) => (
                    <li key={idx}>
                      <strong>{gl.term}:</strong> {gl.definition}
                    </li>
                  ))}
                </ul>
                <Typography variant="subtitle1">Citas bíblicas:</Typography>
                <ul>
                  {summary.bibleQuotes.map((bq, idx) => (
                    <li key={idx}>{bq}</li>
                  ))}
                </ul>
              </>
            ) : (
              <Typography color="textSecondary">Sin resumen aún.</Typography>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};

export default SummaryTab;
