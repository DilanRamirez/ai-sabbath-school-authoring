"use client";

import type React from "react";
import {
  useState,
  useCallback,
  useMemo,
  Suspense,
  lazy,
  useEffect,
} from "react";
const LAYOUT_SPACING = 2;
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
} from "@mui/material";
import { Calendar, FileText, Eye, Upload } from "lucide-react";
import { LessonMetadataPanel } from "./components/lesson-metadata-panel";
import { DaysGrid } from "./components/days-grid";
import { JsonPreview } from "./components/json-preview";
import { FileUpload } from "./components/file-upload";
import { ExportControls } from "./components/export-controls";
import type { WeekSchema } from "./types/lesson-schema";
import {
  detectDayFromContent,
  parseMarkdownByHeadings,
  sanitizeWeekDataDownload,
} from "./utils/markdown-utils";
import { importLesson } from "./components/api/api";
import JsonImport from "./components/json-import";
import { AutoAwesome } from "@mui/icons-material";
import SummaryTab from "./components/lesson-ai-summary";
const PreviewPane = lazy(() => import("./components/preview-pane"));
/**
 * Hook: Syncs a state value to localStorage with a debounce.
 * @param key localStorage key
 * @param initialValue initial state
 * @param delay debounce delay in ms
 */
function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  delay = 300
) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        localStorage.removeItem(key);
      }
    }
    return initialValue;
  });
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, delay);
    return () => clearTimeout(handler);
  }, [key, value, delay]);
  return [value, setValue] as const;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: LAYOUT_SPACING }}>{children}</Box>}
    </div>
  );
}

const defaultWeekData: WeekSchema = {
  id: "",
  lesson_number: 1,
  title: "",
  quarter: "",
  year: "",
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
  const [rawMarkdown, setRawMarkdown] = useDebouncedLocalStorage<string>(
    "rawMarkdown",
    ""
  );
  const [weekData, setWeekData] = useDebouncedLocalStorage<WeekSchema>(
    "weekData",
    defaultWeekData
  );
  // New state for storing PDF file
  const [pdfFile, setPdfFile] = useState<File | null>(null);
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

  const handleJsonPopulate = useCallback(
    (importedData: WeekSchema) => {
      setWeekData(importedData);
      setNotification({
        open: true,
        message: "Lesson JSON imported successfully",
        severity: "success",
      });
      setCurrentTab(1); // switch to the Days & Sections view
    },
    [setWeekData]
  );

  // Auto-generate ID from week end date (renamed and simplified)
  const handleEndDateChange = useCallback(
    (endDate: string) => {
      if (!endDate) return;
      setWeekData((prev) => ({
        ...prev,
        week_range: { ...prev.week_range, end: endDate },
        id: endDate,
      }));
    },
    [setWeekData]
  );

  /**
   * Handles file upload, parsing, and updates state.
   */
  const handleFileUpload = useCallback(
    (content: string, filename: string, file: File) => {
      if (!content || !file) {
        setNotification({
          open: true,
          message: "No file content found",
          severity: "error",
        });
        return;
      }
      try {
        setPdfFile(file);
        // Remove any previous rawMarkdown and weekData
        localStorage.removeItem("rawMarkdown");
        localStorage.removeItem("weekData");

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

        setWeekData(() => {
          // Start from a fresh default template for a new import
          const freshDays = defaultWeekData.days.map((day) => {
            const match = daySections[day.day];
            if (match) {
              return { ...day, title: match.title, rawMarkdown: match.content };
            }
            // No content for this day yet
            return { ...day, title: "", rawMarkdown: "", sections: [] };
          });
          const newWeekData: WeekSchema = {
            ...defaultWeekData,
            title,
            memory_verse: { text: memoryVerse, reference: memoryReference },
            days: freshDays,
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
    [setRawMarkdown, setWeekData]
  );

  /**
   * Handles importing JSON content for a lesson.
   */
  const handleJsonImport = useCallback(
    (jsonContent: string) => {
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
    },
    [setWeekData]
  );

  /**
   * Validates the current week data for required fields.
   */
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

  /**
   * Exports the lesson as a JSON file.
   */
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
    const sanitized = sanitizeWeekDataDownload(weekData);
    const blob = new Blob([JSON.stringify(sanitized, null, 2)], {
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

  /**
   * Submits the lesson and PDF to the backend API.
   */
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
    if (!pdfFile) {
      setNotification({
        open: true,
        message: "Upload a PDF before submitting.",
        severity: "error",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Use the importLesson API helper
      const year = weekData.year;
      const quarter = weekData.quarter;
      const lessonNumber = String(weekData.lesson_number);
      const result = await importLesson(
        year,
        quarter,
        lessonNumber,
        weekData,
        pdfFile
      );
      setNotification({
        open: true,
        message: `Import successful: ${result.message}`,
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Import failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [weekData, validateWeekData, pdfFile]);

  const totalDaysWithContent = useMemo(
    () =>
      weekData.days.reduce(
        (count, day) => (day.rawMarkdown?.trim() ? count + 1 : count),
        0
      ),
    [weekData.days]
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar variant="dense">
          <Grid
            container
            alignItems="center"
            spacing={1}
            sx={{ flexWrap: "wrap" }}
          >
            <Grid item xs>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  mt: 2,
                  mb: 2,
                }}
              >
                Sabbath School Authoring Tool
              </Typography>
            </Grid>
            <Grid item sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Chip
                label={`Lesson ${weekData.lesson_number}`}
                color="secondary"
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "white",
                  mr: { xs: 0.5, sm: 1 },
                  mb: { xs: 0.5, sm: 0 },
                }}
              />
              <Chip
                label={`${totalDaysWithContent}/7 days`}
                color="secondary"
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "white",
                }}
              />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {isLoading && <LinearProgress />}

      <Container maxWidth="xl" sx={{ p: LAYOUT_SPACING }}>
        <Box
          sx={{ borderBottom: 1, borderColor: "divider", mb: { xs: 2, sm: 3 } }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => {
              console.log("Switching to tab:", newValue);
              setCurrentTab(newValue);
            }}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Responsive Tabs"
          >
            <Tab icon={<Upload />} label="Upload & Metadata" />
            <Tab icon={<Calendar />} label="Days & Sections" />
            <Tab icon={<AutoAwesome />} label="Summary per Day" />
            <Tab icon={<Eye />} label="JSON Preview" />
            <Tab icon={<FileText />} label="Export & Submit" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={LAYOUT_SPACING}>
            <Grid>
              <LessonMetadataPanel
                weekData={weekData}
                onUpdateWeekData={setWeekData}
                onUpdateWeekEndDate={handleEndDateChange}
              />
            </Grid>
            <Grid sx={{ width: "100%" }}>
              <FileUpload
                onFileUpload={handleFileUpload}
                onJsonImport={handleJsonImport}
              />

              <JsonImport onJsonImport={handleJsonPopulate} />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <DaysGrid weekData={weekData} onUpdateWeekData={setWeekData} />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <SummaryTab lesson={weekData} llmEndpoint={"llmEndpoint"} />
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <JsonPreview
            weekData={weekData}
            validationErrors={validateWeekData()}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={4}>
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
            p: LAYOUT_SPACING,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "grey.300",
            minHeight: "200px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Raw Markdown Content - Complete Lesson
          </Typography>
          <Suspense fallback={<LinearProgress />}>
            <PreviewPane content={rawMarkdown} />
          </Suspense>
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
