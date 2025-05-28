"use client";

import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
} from "@mui/material";
import {
  Download,
  Send,
  FileText,
  Database,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { WeekSchema } from "../types/lesson-schema";

interface ExportControlsProps {
  onExportJSON: () => void;
  onSubmitToBackend: () => void;
  isLoading: boolean;
  validationErrors: string[];
  weekData: WeekSchema;
}

export function ExportControls({
  onExportJSON,
  onSubmitToBackend,
  isLoading,
  validationErrors,
  weekData,
}: ExportControlsProps) {
  const isValid = validationErrors.length === 0;
  const daysWithContent = weekData.days.filter((day) =>
    day?.rawMarkdown?.trim()
  ).length;

  return (
    <Box>
      {!isValid && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Validation Issues Found:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FileText className="mr-2" />
                <Typography variant="h6">Export Week JSON</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Download the complete week schema as a JSON file for backend
                processing.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`Lesson ${weekData.lesson_number}`}
                  size="small"
                  color="primary"
                />
                <Chip label={`${daysWithContent}/7 days`} size="small" />
                <Chip
                  label={isValid ? "Valid" : "Has errors"}
                  size="small"
                  color={isValid ? "success" : "error"}
                  icon={
                    isValid ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )
                  }
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={onExportJSON}
                disabled={daysWithContent === 0}
                fullWidth
              >
                Export JSON
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Database className="mr-2" />
                <Typography variant="h6">Submit to Backend</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Send the week schema to the backend for persistence and
                processing.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Endpoint: POST /api/v1/lessons
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                color="success"
                startIcon={<Send />}
                onClick={onSubmitToBackend}
                disabled={!isValid || daysWithContent === 0 || isLoading}
                fullWidth
              >
                {isLoading ? "Submitting..." : "Submit to Backend"}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
