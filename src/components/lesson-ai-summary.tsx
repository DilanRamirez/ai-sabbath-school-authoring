// Props for the new SummaryTab component
interface SummaryTabProps {
  lesson: WeekSchema;
  setSummaries: React.Dispatch<React.SetStateAction<DaySummary[]>>;
  summaries: DaySummary[];
}

import React, { useState, useCallback } from "react";
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Paper,
  TextField,
} from "@mui/material";
import type { DaySummary, WeekSchema } from "../types/lesson-schema";
import { generateDaySummary } from "./api/api";

const SummaryTab: React.FC<SummaryTabProps> = ({
  lesson,
  summaries,
  setSummaries,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update a top-level field (e.g., summary)
  const updateSummaryField = (
    day: string,
    field: keyof DaySummary,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ) => {
    setSummaries((prev) =>
      prev.map((s) => (s.day === day ? { ...s, [field]: value } : s))
    );
  };

  // Update keyPoints array
  const updateKeyPoint = (day: string, index: number, value: string) => {
    setSummaries((prev) =>
      prev.map((s) => {
        if (s.day !== day) return s;
        const newPoints = [...s.keyPoints];
        newPoints[index] = value;
        return { ...s, keyPoints: newPoints };
      })
    );
  };

  // Update glossary definitions
  const updateGlossary = (day: string, term: string, value: string) => {
    setSummaries((prev) =>
      prev.map((s) => {
        if (s.day !== day) return s;
        return {
          ...s,
          glossary: { ...s.glossary, [term]: value },
        };
      })
    );
  };

  // Update citations reference
  const updateCitation = (day: string, index: number, value: string) => {
    setSummaries((prev) =>
      prev.map((s) => {
        if (s.day !== day) return s;
        const newCites = [...s.citations];
        newCites[index] = { ...newCites[index], reference: value };
        return { ...s, citations: newCites };
      })
    );
  };

  const generateSummaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateDaySummary(lesson);
      setSummaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [lesson]);

  return (
    <Box p={2}>
      <Box
        mb={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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

        <Button variant="contained" onClick={() => null} disabled={loading}>
          Guardar
        </Button>
      </Box>
      {lesson.days.map((day) => {
        const summary = summaries.find((s) => s.day === day.day);
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
                <TextField
                  multiline
                  fullWidth
                  label="Resumen general"
                  value={summary.summary}
                  onChange={(e) =>
                    updateSummaryField(day.day, "summary", e.target.value)
                  }
                  sx={{ mb: 2 }}
                />
                <Typography variant="subtitle1">Puntos clave:</Typography>
                {summary.keyPoints.map((pt, idx) => (
                  <TextField
                    key={idx}
                    fullWidth
                    label={`Punto clave ${idx + 1}`}
                    value={pt}
                    onChange={(e) =>
                      updateKeyPoint(day.day, idx, e.target.value)
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
                <Typography variant="subtitle1">
                  Glosario de términos:
                </Typography>
                {Object.entries(summary.glossary).map(([term, def]) => (
                  <Box key={term} sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">{term}</Typography>
                    <TextField
                      fullWidth
                      label="Definición"
                      value={def}
                      onChange={(e) =>
                        updateGlossary(day.day, term, e.target.value)
                      }
                    />
                  </Box>
                ))}
                <Typography variant="subtitle1">Citas bíblicas:</Typography>
                {summary.citations.map((cite, idx) => (
                  <TextField
                    key={idx}
                    fullWidth
                    label={`Cita ${idx + 1}`}
                    value={cite.reference}
                    onChange={(e) =>
                      updateCitation(day.day, idx, e.target.value)
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
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
