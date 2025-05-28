import React from "react";
import { Button } from "@mui/material";

interface SaveButtonProps {
  content: string;
  filename: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ content, filename }) => {
  const handleSave = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleSave}
      sx={{ mt: 2 }}
    >
      Save Markdown
    </Button>
  );
};

export default SaveButton;
