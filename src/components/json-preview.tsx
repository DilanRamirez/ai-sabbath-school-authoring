"use client";

import { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
} from "@mui/material";
import { ChevronDown, Copy, CheckCircle, AlertCircle } from "lucide-react";
import type { WeekSchema } from "../types/lesson-schema";

interface JsonPreviewProps {
  weekData: WeekSchema;
  validationErrors: string[];
}

export function JsonPreview({ weekData, validationErrors }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(weekData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonString = JSON.stringify(weekData, null, 2);
  const isValid = validationErrors.length === 0;

  return (
    <Box>
      {/* Validation Status */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isValid ? (
              <CheckCircle color="green" />
            ) : (
              <AlertCircle color="orange" />
            )}
            <Typography variant="h6">Schema Validation</Typography>
            <Chip
              label={isValid ? "Valid" : `${validationErrors.length} errors`}
              color={isValid ? "success" : "error"}
              size="small"
            />
          </Box>
          <Button
            startIcon={copied ? <CheckCircle /> : <Copy />}
            onClick={copyToClipboard}
            variant="outlined"
            size="small"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </Button>
        </Box>

        {!isValid && (
          <Box sx={{ mt: 2 }}>
            {validationErrors.map((error, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ))}
          </Box>
        )}
      </Paper>

      {/* JSON Preview */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Week Schema JSON
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Typography>Raw JSON Output</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              component="pre"
              sx={{
                bgcolor: "grey.100",
                p: 2,
                borderRadius: 1,
                overflow: "auto",
                maxHeight: "600px",
                fontSize: "12px",
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              }}
            >
              {jsonString}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Typography>Schema Summary</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                label={`Lesson ${weekData.lesson_number}`}
                color="primary"
              />
              <Chip label={`${weekData.days.length} days`} />
              <Chip
                label={`${weekData.days.reduce(
                  (sum, day) => sum + day.sections.length,
                  0
                )} total sections`}
              />
              <Chip
                label={
                  weekData.memory_verse.text
                    ? "Memory verse set"
                    : "No memory verse"
                }
                color={weekData.memory_verse.text ? "success" : "default"}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
}
