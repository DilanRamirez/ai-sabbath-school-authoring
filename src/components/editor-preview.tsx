import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import MarkdownEditor from "./markdown-editor";
import PreviewPane from "./preview-pane";

interface Props {
  markdown: string;
  onChange: (text: string) => void;
}

const EditorPreview: React.FC<Props> = ({ markdown, onChange }) => (
  <Grid container sx={{ display: "flex", flexDirection: "column", mb: 4 }}>
    <Grid item xs={6}>
      <Paper sx={{ p: 2, height: "60vh", overflowY: "auto", flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Live Preview
        </Typography>
        <MarkdownEditor value={markdown} onChange={onChange} />
      </Paper>
    </Grid>
    <Grid item xs={6}>
      <Paper sx={{ p: 2, height: "60vh", overflowY: "auto", flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          Live Preview
        </Typography>
        <PreviewPane content={markdown} />
      </Paper>
    </Grid>
  </Grid>
);

export default EditorPreview;
