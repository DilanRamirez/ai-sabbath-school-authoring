"use client";

import type React from "react";
import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
} from "@mui/material";
import { Upload, FileText, Code, FileImage } from "lucide-react";
import { data } from "./data";
import { parsePdf } from "./api/api";

interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
  onJsonImport: (content: string) => void;
}

// Mock data - the actual Markdown content from PDF conversion
const MOCK_PDF_TO_MARKDOWN = data;

export function FileUpload({ onFileUpload, onJsonImport }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadTab, setUploadTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      const isMarkdown =
        file.name.endsWith(".md") || file.name.endsWith(".markdown");
      const isJson = file.name.endsWith(".json");
      const isPdf = file.name.endsWith(".pdf");

      if (!isMarkdown && !isJson && !isPdf) {
        setError(
          "Please upload a Markdown file (.md, .markdown), JSON file (.json), or PDF file (.pdf)"
        );
        return;
      }

      if (isPdf) {
        // Handle PDF upload - convert to Markdown via API
        setIsProcessing(true);
        try {
          const result = await parsePdf(file);
          console.log("PDF converted to Markdown:", result);
          onFileUpload(result, `${file.name} (converted to Markdown)`);
          setError(null);
        } catch (error) {
          setError(
            `Failed to process PDF: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      // Handle Markdown and JSON files
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (isJson) {
          onJsonImport(content);
        } else {
          onFileUpload(content, file.name);
        }
        setError(null);
      };
      reader.readAsText(file);
    },
    [onFileUpload, onJsonImport]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  // Demo button to load mock data
  const loadMockData = useCallback(() => {
    onFileUpload(MOCK_PDF_TO_MARKDOWN, "lesson-8-mock.md");
  }, [onFileUpload]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Content
      </Typography>

      <Tabs
        value={uploadTab}
        onChange={(_, newValue) => setUploadTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab icon={<FileImage />} label="PDF" />
        <Tab icon={<FileText />} label="Markdown" />
        <Tab icon={<Code />} label="JSON Import" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isProcessing && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 1 }}>
            Processing PDF and converting to Markdown...
          </Alert>
          <LinearProgress />
        </Box>
      )}

      <Paper
        sx={{
          p: 4,
          border: "2px dashed",
          borderColor: dragActive ? "primary.main" : "grey.300",
          bgcolor: dragActive ? "primary.50" : "grey.50",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "primary.50",
          },
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        {uploadTab === 0 ? (
          <>
            <FileImage size={48} color="#666" style={{ marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              Drop your PDF file here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              PDF will be converted to Markdown automatically
            </Typography>
          </>
        ) : uploadTab === 1 ? (
          <>
            <FileText size={48} color="#666" style={{ marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              Drop your Markdown file here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Raw Markdown from PDF conversion
            </Typography>
          </>
        ) : (
          <>
            <Code size={48} color="#666" style={{ marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              Import existing lesson JSON
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Re-import previously exported lesson data
            </Typography>
          </>
        )}

        <Button
          variant="contained"
          startIcon={<Upload />}
          sx={{ mt: 2 }}
          disabled={isProcessing}
        >
          Choose File
        </Button>

        <input
          id="file-input"
          type="file"
          accept={
            uploadTab === 0
              ? ".pdf"
              : uploadTab === 1
              ? ".md,.markdown"
              : ".json"
          }
          onChange={handleFileInput}
          style={{ display: "none" }}
        />
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block" }}
      >
        {uploadTab === 0
          ? "Upload PDF files to automatically convert to structured Markdown"
          : uploadTab === 1
          ? "Upload raw Markdown content to begin structuring your lesson"
          : "Import a previously exported lesson JSON to continue editing"}
      </Typography>

      {/* Demo Section */}
      <Box sx={{ mt: 3, p: 2, bgcolor: "info.50", borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom color="info.main">
          Demo Mode
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Try the tool with sample lesson content from Lesson 8: "En los Salmos
          - Primera Parte"
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={loadMockData}
          color="info"
        >
          Load Sample Lesson
        </Button>
      </Box>
    </Box>
  );
}
