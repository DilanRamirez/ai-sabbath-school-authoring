"use client";

import { useState } from "react";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Chip,
  Divider,
  Paper,
  Alert,
} from "@mui/material";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  CalendarIcon,
} from "lucide-react";
import type { WeekSchema, Day, DayType } from "../types/lesson-schema";

interface DaysGridProps {
  weekData: WeekSchema;
  onUpdateWeekData: (data: WeekSchema) => void;
}

export function DaysGrid({ weekData, onUpdateWeekData }: DaysGridProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));
  const [copiedDay, setCopiedDay] = useState<number | null>(null);

  const toggleDay = (dayIndex: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayIndex)) {
      newExpanded.delete(dayIndex);
    } else {
      newExpanded.add(dayIndex);
    }
    setExpandedDays(newExpanded);
  };

  const updateDay = (dayIndex: number, field: keyof Day, value: any) => {
    const newDays = [...weekData.days];
    newDays[dayIndex] = { ...newDays[dayIndex], [field]: value };
    onUpdateWeekData({ ...weekData, days: newDays });
  };

  const copyToClipboard = async (content: string, dayIndex: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedDay(dayIndex);
      setTimeout(() => setCopiedDay(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const expandAllDays = () => {
    setExpandedDays(new Set(weekData.days.map((_, index) => index)));
  };

  const collapseAllDays = () => {
    setExpandedDays(new Set());
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Daily Sections
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" size="small" onClick={expandAllDays}>
            Expand All
          </Button>
          <Button variant="outlined" size="small" onClick={collapseAllDays}>
            Collapse All
          </Button>
        </Box>
      </Box>

      {weekData.days.filter((day) => !day.rawMarkdown.trim()).length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Some days don't have content yet. Upload a markdown file in the
            "Upload & Metadata" tab to automatically split content by daily
            sections.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {weekData.days.map((day, dayIndex) => (
          <Grid item xs={12} key={`day-${dayIndex}`}>
            <Card>
              <CardHeader
                title={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="h6">
                      {day.day} - {day.title || "Untitled"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={day.type}
                        color={
                          day.type === "introduction"
                            ? "primary"
                            : day.type === "review"
                            ? "secondary"
                            : "default"
                        }
                        size="small"
                      />
                      <Chip
                        label={
                          day.rawMarkdown.trim()
                            ? `${day.rawMarkdown.length} chars`
                            : "No content"
                        }
                        size="small"
                        variant="outlined"
                        color={day.rawMarkdown.trim() ? "success" : "default"}
                      />
                    </Box>
                  </Box>
                }
                action={
                  <IconButton onClick={() => toggleDay(dayIndex)}>
                    {expandedDays.has(dayIndex) ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </IconButton>
                }
              />

              {expandedDays.has(dayIndex) && (
                <CardContent>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={day.date}
                        onChange={(e) =>
                          updateDay(dayIndex, "date", e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={day.type}
                          label="Type"
                          onChange={(e) =>
                            updateDay(
                              dayIndex,
                              "type",
                              e.target.value as DayType
                            )
                          }
                        >
                          <MenuItem value="introduction">Introduction</MenuItem>
                          <MenuItem value="devotional">Devotional</MenuItem>
                          <MenuItem value="review">Review</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Day Title"
                        value={day.title}
                        onChange={(e) =>
                          updateDay(dayIndex, "title", e.target.value)
                        }
                        required
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Raw Markdown Content */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="subtitle1">
                        <CalendarIcon className="inline mr-2" size={20} />
                        Raw Markdown Content
                      </Typography>
                      <Button
                        size="small"
                        startIcon={
                          copiedDay === dayIndex ? <CheckCircle /> : <Copy />
                        }
                        onClick={() =>
                          copyToClipboard(day.rawMarkdown, dayIndex)
                        }
                        variant="outlined"
                        disabled={!day.rawMarkdown.trim()}
                      >
                        {copiedDay === dayIndex ? "Copied!" : "Copy"}
                      </Button>
                    </Box>

                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.300",
                        minHeight: "200px",
                      }}
                    >
                      <TextField
                        fullWidth
                        multiline
                        rows={12}
                        value={day.rawMarkdown}
                        onChange={(e) =>
                          updateDay(dayIndex, "rawMarkdown", e.target.value)
                        }
                        placeholder={`Paste or edit the raw markdown content for ${day.day}...`}
                        variant="outlined"
                        sx={{
                          "& .MuiInputBase-input": {
                            fontFamily:
                              'Monaco, Consolas, "Courier New", monospace',
                            fontSize: "14px",
                            lineHeight: 1.5,
                          },
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                          },
                        }}
                      />
                    </Paper>

                    {day.rawMarkdown.trim() && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Content length: {day.rawMarkdown.length} characters,{" "}
                        {day.rawMarkdown.split("\n").length} lines
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
