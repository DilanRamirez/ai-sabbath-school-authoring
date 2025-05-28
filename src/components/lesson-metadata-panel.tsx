"use client";

import { memo, useCallback } from "react";
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Box,
  Divider,
  InputAdornment,
} from "@mui/material";
import Container from "@mui/material/Container";
import { Calendar, BookOpen } from "lucide-react";
import type { WeekSchema } from "../types/lesson-schema";

interface LessonMetadataPanelProps {
  weekData: WeekSchema | null | undefined;
  onUpdateWeekData: (data: WeekSchema) => void;
  onUpdateWeekEndDate: (date: string) => void;
}

function LessonMetadataPanelComponent({
  weekData,
  onUpdateWeekData,
  onUpdateWeekEndDate,
}: LessonMetadataPanelProps) {
  const handleFieldUpdate = useCallback(
    (field: keyof WeekSchema, value: string | number) => {
      if (!weekData) return;
      onUpdateWeekData({ ...weekData, [field]: value });
    },
    [onUpdateWeekData, weekData]
  );

  const handleWeekRangeChange = useCallback(
    (field: keyof WeekSchema["week_range"], value: string) => {
      if (!weekData) return;
      const newWeekRange = { ...weekData.week_range, [field]: value };
      onUpdateWeekData({
        ...weekData,
        week_range: newWeekRange,
      });

      if (field === "end") {
        onUpdateWeekEndDate(value);
      }
    },
    [onUpdateWeekData, onUpdateWeekEndDate, weekData]
  );

  const handleMemoryVerseChange = useCallback(
    (field: keyof WeekSchema["memory_verse"], value: string) => {
      if (!weekData) return;
      onUpdateWeekData({
        ...weekData,
        memory_verse: { ...weekData.memory_verse, [field]: value },
      });
    },
    [onUpdateWeekData, weekData]
  );

  if (!weekData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" role="alert">
          Error: Missing week data.
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" component={Paper}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <BookOpen className="mr-2" aria-hidden="true" />
        <Typography variant="h6">Lesson Metadata</Typography>
      </Box>

      <Grid container spacing={2} alignItems="flex-start">
        {/* Basic Info */}
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              <Calendar className="inline mr-1" size={16} aria-hidden="true" />
              Lesson Details
            </Typography>
          </Divider>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Lesson Title"
              aria-label="Lesson Title"
              value={weekData.title}
              onChange={(e) => handleFieldUpdate("title", e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BookOpen aria-hidden="true" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Lesson Number"
              aria-label="Lesson Number"
              type="number"
              value={weekData.lesson_number}
              onChange={(e) =>
                handleFieldUpdate(
                  "lesson_number",
                  Number.parseInt(e.target.value) || 1
                )
              }
              inputProps={{ min: 1, max: 13 }}
              required
            />
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ mb: 2 }}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              <Calendar className="inline mr-1" size={16} aria-hidden="true" />
              Lesson Timing
            </Typography>
          </Divider>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Quarter"
              aria-label="Quarter"
              value={weekData.quarter}
              onChange={(e) => handleFieldUpdate("quarter", e.target.value)}
            />
            <TextField
              fullWidth
              label="Year"
              aria-label="Year"
              type="number"
              value={weekData.year}
              onChange={(e) =>
                handleFieldUpdate(
                  "year",
                  Number.parseInt(e.target.value) || 9999
                )
              }
            />
          </Box>
        </Grid>
        {/* Week Range */}
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              <Calendar className="inline mr-1" size={16} aria-hidden="true" />
              Week Range
            </Typography>
          </Divider>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Week Start Date"
              aria-label="Week Start Date"
              type="date"
              value={weekData.week_range.start}
              onChange={(e) => handleWeekRangeChange("start", e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Calendar size={20} aria-hidden="true" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Week End Date"
              aria-label="Week End Date"
              type="date"
              value={weekData.week_range.end}
              onChange={(e) => handleWeekRangeChange("end", e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Calendar size={20} aria-hidden="true" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Grid>
        {/* Memory Verse */}
        <Grid item xs={12} sx={{ mb: 2 }}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Memory Verse
            </Typography>
          </Divider>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <TextField
              fullWidth
              label="Memory Verse Text"
              aria-label="Memory Verse Text"
              value={weekData.memory_verse.text}
              onChange={(e) => handleMemoryVerseChange("text", e.target.value)}
              placeholder="Enter the memory verse text..."
              required
            />
            <TextField
              fullWidth
              label="Verse Reference"
              aria-label="Verse Reference"
              value={weekData.memory_verse.reference}
              onChange={(e) =>
                handleMemoryVerseChange("reference", e.target.value)
              }
              placeholder="e.g., Apoc. 14:1"
              required
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export const LessonMetadataPanel = memo(LessonMetadataPanelComponent);
