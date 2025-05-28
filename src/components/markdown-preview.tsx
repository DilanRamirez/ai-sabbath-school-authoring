"use client";

import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Simple markdown rendering for preview
    const lines = content.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <Typography key={index} variant="h4" component="h1" gutterBottom>
            {line.substring(2)}
          </Typography>
        );
      } else if (line.startsWith("## ")) {
        return (
          <Typography key={index} variant="h5" component="h2" gutterBottom>
            {line.substring(3)}
          </Typography>
        );
      } else if (line.startsWith("### ")) {
        return (
          <Typography key={index} variant="h6" component="h3" gutterBottom>
            {line.substring(4)}
          </Typography>
        );
      } else if (line.startsWith("> ")) {
        return (
          <Box
            key={index}
            sx={{
              borderLeft: "4px solid",
              borderColor: "primary.main",
              pl: 2,
              py: 1,
              my: 1,
              bgcolor: "grey.50",
              fontStyle: "italic",
            }}
          >
            <Typography variant="body1">{line.substring(2)}</Typography>
          </Box>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <Typography key={index} variant="body1" component="li" sx={{ ml: 2 }}>
            {line.substring(2)}
          </Typography>
        );
      } else if (line.trim() === "") {
        return <Box key={index} sx={{ height: "16px" }} />;
      } else {
        return (
          <Typography key={index} variant="body1" paragraph>
            {line}
          </Typography>
        );
      }
    });
  }, [content]);

  return (
    <Box
      sx={{
        height: "500px",
        overflow: "auto",
        p: 2,
        bgcolor: "white",
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1,
      }}
    >
      {renderedContent || (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Preview will appear here as you type...
        </Typography>
      )}
    </Box>
  );
}
