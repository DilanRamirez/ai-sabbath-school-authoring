"use client";

import { Box, TextField } from "@mui/material";

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  return (
    <Box sx={{ height: "500px" }}>
      <TextField
        multiline
        fullWidth
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste or type your Markdown content here..."
        sx={{
          height: "100%",
          "& .MuiInputBase-root": {
            height: "100%",
            alignItems: "flex-start",
          },
          "& .MuiInputBase-input": {
            height: "100% !important",
            overflow: "auto !important",
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: "14px",
            lineHeight: 1.5,
          },
        }}
      />
    </Box>
  );
}
