"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  TextField,
} from "@mui/material";
import { Calendar, FileText, Eye, Upload } from "lucide-react";
import { LessonMetadataPanel } from "./components/lesson-metadata-panel";
import { DaysGrid } from "./components/days-grid";
import { JsonPreview } from "./components/json-preview";
import { FileUpload } from "./components/file-upload";
import { ExportControls } from "./components/export-controls";
import type { WeekSchema, DayType } from "./types/lesson-schema";
import { mockApiService } from "./services/api";
import {
  detectDayFromContent,
  parseMarkdownByHeadings,
} from "./utils/markdown-utils";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const defaultWeekData: WeekSchema = {
  id: "",
  lesson_number: 1,
  title: "",
  week_range: {
    start: "",
    end: "",
  },
  memory_verse: {
    text: "",
    reference: "",
  },
  days: [
    {
      day: "Sábado",
      date: "",
      type: "introduction",
      title: "Introducción",
      rawMarkdown: "",
      sections: [],
    },
    {
      day: "Domingo",
      date: "",
      type: "devotional",
      title: "",
      rawMarkdown: "",
      sections: [],
    },
    {
      day: "Lunes",
      date: "",
      type: "devotional",
      title: "",
      rawMarkdown: "",
      sections: [],
    },
    {
      day: "Martes",
      date: "",
      type: "devotional",
      title: "",
      rawMarkdown: "",
      sections: [],
    },
    {
      day: "Miércoles",
      date: "",
      type: "devotional",
      title: "",
      rawMarkdown: "",
      sections: [],
    },
    {
      day: "Jueves",
      date: "",
      type: "devotional",
      title: "",
      rawMarkdown: "",
      sections: [],
    },
    {
      day: "Viernes",
      date: "",
      type: "review",
      title: "PARA ESTUDIAR Y MEDITAR",
      rawMarkdown: "",
      sections: [],
    },
  ],
};

export default function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [rawMarkdown, setRawMarkdown] = useState("");
  const [weekData, setWeekData] = useState<WeekSchema>(() => {
    const stored = localStorage.getItem("weekData");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultWeekData;
      }
    }
    return defaultWeekData;
  });

  // Load rawMarkdown from localStorage on mount
  useEffect(() => {
    const storedMarkdown = localStorage.getItem("rawMarkdown");
    if (storedMarkdown) {
      setRawMarkdown(storedMarkdown);
    }
  }, []);

  // Store weekData to localStorage on every update
  useEffect(() => {
    localStorage.setItem("weekData", JSON.stringify(weekData));
  }, [weekData]);

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Auto-generate ID from week end date
  const updateWeekEndDate = useCallback((date: string) => {
    setWeekData((prev) => ({
      ...prev,
      week_range: {
        ...prev.week_range,
        end: date,
      },
      id: date || "",
    }));
  }, []);

  // Handle file upload and parse content
  const handleFileUpload = useCallback(
    (content: string, filename: string) => {
      try {
        const modifiedContent = content
          .split("\n\n")
          .map((chunk) => chunk.replace(/\n/g, ""))
          .join("\n\n");
        setRawMarkdown(modifiedContent);
        localStorage.setItem("rawMarkdown", modifiedContent);

        // Parse markdown content and extract lesson data
        let title = "";
        let memoryVerse = "";
        let memoryReference = "";

        // Extract title from H2 heading
        const titleMatch = content.match(/^##\s+(.+)$/m);
        if (titleMatch) {
          title = titleMatch[1].replace(/\*\*/g, "").trim();
        }

        // Extract memory verse
        const memoryMatch = content.match(
          /(?:PARA MEMORIZAR|Memory Verse):\s*["""]([^"""]+)["""]?\s*$$([^)]+)$$/i
        );
        if (memoryMatch) {
          memoryVerse = memoryMatch[1];
          memoryReference = memoryMatch[2];
        }

        // Parse markdown by headings and split into days
        const parsedSections = parseMarkdownByHeadings(content);

        // Create a lookup of parsed sections by day
        const daySections: Record<string, { title: string; content: string }> =
          {};

        parsedSections.forEach((section, i) => {
          const detected = detectDayFromContent(i);
          if (detected && !daySections[detected]) {
            daySections[detected] = {
              title: section.title,
              content: section.content,
            };
          }
        });

        const updatedDays = weekData.days.map((day) => {
          const match = daySections[day.day];
          return match
            ? { ...day, title: match.title, rawMarkdown: match.content }
            : { ...day };
        });

        setWeekData((prev) => {
          const newWeekData = {
            ...prev,
            title,
            memory_verse: {
              text: memoryVerse,
              reference: memoryReference,
            },
            days: updatedDays,
          };
          localStorage.setItem("weekData", JSON.stringify(newWeekData));
          return newWeekData;
        });

        setNotification({
          open: true,
          message: `Successfully loaded ${filename}. Content has been split into daily sections. Switch to "Days & Sections" tab to review.`,
          severity: "success",
        });

        // Auto-switch to days tab
        setCurrentTab(1);
      } catch (error) {
        setNotification({
          open: true,
          message: `Error parsing file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          severity: "error",
        });
      }
    },
    [weekData.days]
  );

  // Handle JSON import
  const handleJsonImport = useCallback((jsonContent: string) => {
    try {
      const importedData: WeekSchema = JSON.parse(jsonContent);
      setWeekData(importedData);
      setNotification({
        open: true,
        message: "JSON lesson data imported successfully",
        severity: "success",
      });
      setCurrentTab(1); // Switch to Days & Sections tab
    } catch (error) {
      setNotification({
        open: true,
        message: `Error importing JSON: ${
          error instanceof Error ? error.message : "Invalid JSON"
        }`,
        severity: "error",
      });
    }
  }, []);

  // Validate the current week data
  const validateWeekData = useCallback(() => {
    const errors: string[] = [];

    if (!weekData.title.trim()) errors.push("Lesson title is required");
    if (!weekData.week_range.start) errors.push("Week start date is required");
    if (!weekData.week_range.end) errors.push("Week end date is required");
    if (!weekData.memory_verse.text.trim())
      errors.push("Memory verse text is required");
    if (!weekData.memory_verse.reference.trim())
      errors.push("Memory verse reference is required");

    weekData.days.forEach((day) => {
      if (!day.date) errors.push(`${day.day} date is required`);
      if (!day.title.trim()) errors.push(`${day.day} title is required`);
    });

    return errors;
  }, [weekData]);

  // Export as JSON
  const exportAsJSON = useCallback(() => {
    const errors = validateWeekData();
    if (errors.length > 0) {
      setNotification({
        open: true,
        message: `Validation errors: ${errors.join(", ")}`,
        severity: "error",
      });
      return;
    }

    const blob = new Blob([JSON.stringify(weekData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lesson-${weekData.lesson_number}-week-${weekData.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setNotification({
      open: true,
      message: "JSON exported successfully",
      severity: "success",
    });
  }, [weekData, validateWeekData]);

  // Submit to backend
  const submitToBackend = useCallback(async () => {
    const errors = validateWeekData();
    if (errors.length > 0) {
      setNotification({
        open: true,
        message: `Validation errors: ${errors.join(", ")}`,
        severity: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      await mockApiService.submitLesson(weekData);

      setNotification({
        open: true,
        message: "Successfully submitted to backend",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to submit: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [weekData, validateWeekData]);

  const totalDaysWithContent = weekData.days.filter((day) =>
    day?.rawMarkdown?.trim()
  ).length;

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Calendar className="mr-2" />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sabbath School Authoring Tool
          </Typography>
          <Chip
            label={`Lesson ${weekData.lesson_number}`}
            color="secondary"
            variant="outlined"
            sx={{ color: "white", borderColor: "white", mr: 1 }}
          />
          <Chip
            label={`${totalDaysWithContent}/7 days`}
            color="secondary"
            variant="outlined"
            sx={{ color: "white", borderColor: "white" }}
          />
        </Toolbar>
      </AppBar>

      {isLoading && <LinearProgress />}

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
          >
            <Tab icon={<Upload />} label="Upload & Metadata" />
            <Tab icon={<Calendar />} label="Days & Sections" />
            <Tab icon={<Eye />} label="JSON Preview" />
            <Tab icon={<FileText />} label="Export & Submit" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid>
              <LessonMetadataPanel
                weekData={weekData}
                onUpdateWeekData={setWeekData}
                onUpdateWeekEndDate={updateWeekEndDate}
              />
            </Grid>
            <Grid>
              <FileUpload
                onFileUpload={handleFileUpload}
                onJsonImport={handleJsonImport}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <DaysGrid weekData={weekData} onUpdateWeekData={setWeekData} />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <JsonPreview
            weekData={weekData}
            validationErrors={validateWeekData()}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <ExportControls
            onExportJSON={exportAsJSON}
            onSubmitToBackend={submitToBackend}
            isLoading={isLoading}
            validationErrors={validateWeekData()}
            weekData={weekData}
          />
        </TabPanel>

        <Paper
          sx={{
            p: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.300",
            minHeight: "200px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Raw Markdown Content - Complete Lesson
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={12}
            value={rawMarkdown}
            onChange={(e) => handleFileUpload(e.target.value, "raw-content.md")}
            variant="outlined"
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: "14px",
                lineHeight: 1.5,
              },
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
              },
            }}
          />
        </Paper>
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
