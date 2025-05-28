import React from "react";
import { Paper, Box } from "@mui/material";
import ReactMarkdown from "react-markdown";

interface PreviewPaneProps {
  content: string;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ content }) => (
  <Paper elevation={3} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
    <Box sx={{ maxHeight: "30vh", overflowY: "auto" }}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  </Paper>
);

export default PreviewPane;
