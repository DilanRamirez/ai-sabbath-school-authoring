// src/components/JsonImport.tsx
import React, { useState, useCallback, type ChangeEvent } from "react";
import { Button, Alert, Box } from "@mui/material";
import { Upload } from "lucide-react";

interface JsonImportProps {
  /** Called with the parsed JSON object when the file is successfully imported */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onJsonImport: (data: any) => void;
}

const JsonImport: React.FC<JsonImportProps> = ({ onJsonImport }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/json") {
        setError("Please select a valid JSON file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const parsed = JSON.parse(text);
          onJsonImport(parsed);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          console.error("JSON parse error:", err);
          setError("Failed to parse JSON: invalid format.");
        }
      };
      reader.onerror = () => {
        console.error("File read error:", reader.error);
        setError("Error reading file.");
      };
      reader.readAsText(file);
      // Clear the input so the same file can be re-uploaded if needed
      e.target.value = "";
    },
    [onJsonImport]
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        component="label"
        startIcon={<Upload />}
        fullWidth
      >
        Import JSON
        <input
          type="file"
          accept="application/json"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default JsonImport;
