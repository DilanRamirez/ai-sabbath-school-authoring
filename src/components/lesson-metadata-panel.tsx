"use client";

import {
  Paper,
  Typography,
  Grid,
  TextField,
  Box,
  Divider,
} from "@mui/material";
import { Calendar, BookOpen } from "lucide-react";
import type { WeekSchema } from "../types/lesson-schema";

interface LessonMetadataPanelProps {
  weekData: WeekSchema;
  onUpdateWeekData: (data: WeekSchema) => void;
  onUpdateWeekEndDate: (date: string) => void;
}

export function LessonMetadataPanel({
  weekData,
  onUpdateWeekData,
  onUpdateWeekEndDate,
}: LessonMetadataPanelProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateField = (field: keyof WeekSchema, value: any) => {
    onUpdateWeekData({ ...weekData, [field]: value });
  };

  const updateWeekRange = (
    field: keyof WeekSchema["week_range"],
    value: string
  ) => {
    const newWeekRange = { ...weekData.week_range, [field]: value };
    onUpdateWeekData({
      ...weekData,
      week_range: newWeekRange,
    });

    // Auto-generate ID from end date
    if (field === "end") {
      onUpdateWeekEndDate(value);
    }
  };

  const updateMemoryVerse = (
    field: keyof WeekSchema["memory_verse"],
    value: string
  ) => {
    onUpdateWeekData({
      ...weekData,
      memory_verse: { ...weekData.memory_verse, [field]: value },
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <BookOpen className="mr-2" />
        <Typography variant="h6">Lesson Metadata</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Lesson Title"
            value={weekData.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Lesson Number"
            type="number"
            value={weekData.lesson_number}
            onChange={(e) =>
              updateField("lesson_number", Number.parseInt(e.target.value) || 1)
            }
            inputProps={{ min: 1, max: 13 }}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Auto-Generated ID"
            value={weekData.id}
            InputProps={{ readOnly: true }}
            helperText="Generated from week end date"
          />
        </Grid>

        {/* Week Range */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              <Calendar className="inline mr-1" size={16} />
              Week Range
            </Typography>
          </Divider>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Week Start Date"
            type="date"
            value={weekData.week_range.start}
            onChange={(e) => updateWeekRange("start", e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Week End Date"
            type="date"
            value={weekData.week_range.end}
            onChange={(e) => updateWeekRange("end", e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        {/* Memory Verse */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Memory Verse
            </Typography>
          </Divider>
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Memory Verse Text"
            multiline
            rows={3}
            value={weekData.memory_verse.text}
            onChange={(e) => updateMemoryVerse("text", e.target.value)}
            placeholder="Enter the memory verse text..."
            required
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Verse Reference"
            value={weekData.memory_verse.reference}
            onChange={(e) => updateMemoryVerse("reference", e.target.value)}
            placeholder="e.g., Apoc. 14:1"
            required
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
