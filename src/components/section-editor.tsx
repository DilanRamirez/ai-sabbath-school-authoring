/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import { Plus, Trash2, Edit, Eye } from "lucide-react";
import type { Section, SectionType } from "../types/lesson-schema";
import { MarkdownPreview } from "./markdown-preview";
import { MarkdownEditor } from "./markdown-editor";

interface SectionEditorProps {
  section?: Section;
  onUpdate?: (section: Section) => void;
  onRemove?: () => void;
  onAdd?: (section: Section) => void;
  isAddMode?: boolean;
}

export function SectionEditor({
  section,
  onUpdate,
  onRemove,
  onAdd,
  isAddMode = false,
}: SectionEditorProps) {
  const [isEditing, setIsEditing] = useState(isAddMode);
  const [showPreview, setShowPreview] = useState(false);
  const [newSectionType, setNewSectionType] =
    useState<SectionType>("paragraph");
  const [editingSection, setEditingSection] = useState<Section>(
    section ||
      ({
        type: "paragraph",
        content: "",
      } as Section)
  );

  const handleSave = () => {
    if (isAddMode && onAdd) {
      onAdd(editingSection);
      setEditingSection({ type: "paragraph", content: "" } as Section);
    } else if (onUpdate) {
      onUpdate(editingSection);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (isAddMode) {
      setEditingSection({ type: "paragraph", content: "" } as Section);
    } else {
      setEditingSection(section!);
      setIsEditing(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingSection({ ...editingSection, [field]: value } as Section);
  };

  const addArrayItem = (field: string, item: string) => {
    const currentArray = (editingSection as any)[field] || [];
    updateField(field, [...currentArray, item]);
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = (editingSection as any)[field] || [];
    updateField(
      field,
      currentArray.filter((_: any, i: number) => i !== index)
    );
  };

  const updateArrayItem = (field: string, index: number, value: string) => {
    const currentArray = (editingSection as any)[field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    updateField(field, newArray);
  };

  const renderSectionForm = () => {
    switch (editingSection.type) {
      case "reading": {
        const readingSection: Section & {
          label?: string;
          references?: string[];
        } = editingSection;
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={readingSection.label || ""}
              onChange={(e) => updateField("label", e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" gutterBottom>
              Bible References
            </Typography>
            {(readingSection.references || []).map(
              (ref: string, index: number) => (
                <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    value={ref}
                    onChange={(e) =>
                      updateArrayItem("references", index, e.target.value)
                    }
                    placeholder="e.g., John 3:16-17"
                  />
                  <IconButton
                    onClick={() => removeArrayItem("references", index)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              )
            )}
            <Button
              startIcon={<Plus />}
              onClick={() => addArrayItem("references", "")}
              variant="outlined"
              size="small"
            >
              Add Reference
            </Button>
          </>
        );
      }

      case "memory_verse": {
        const memorySection: Section & { label?: string; content?: string } =
          editingSection;
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={memorySection.label || ""}
              onChange={(e) => updateField("label", e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={3}
              value={memorySection.content || ""}
              onChange={(e) => updateField("content", e.target.value)}
            />
          </>
        );
      }

      case "paragraph": {
        const paragraphSection = editingSection as { content: string };
        return (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2">Content</Typography>
              <Button
                size="small"
                startIcon={showPreview ? <Edit /> : <Eye />}
                onClick={() => setShowPreview(!showPreview)}
                variant="outlined"
              >
                {showPreview ? "Edit" : "Preview"}
              </Button>
            </Box>
            {showPreview ? (
              <MarkdownPreview content={paragraphSection.content || ""} />
            ) : (
              <MarkdownEditor
                content={paragraphSection.content || ""}
                onChange={(content) => updateField("content", content)}
              />
            )}
          </Box>
        );
      }

      case "bible_question": {
        const questionSection = editingSection as Section & {
          label?: string;
          question?: string;
        };
        return (
          <>
            <TextField
              fullWidth
              label="Label"
              value={questionSection.label || ""}
              onChange={(e) => updateField("label", e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Question"
              multiline
              rows={3}
              value={questionSection.question || ""}
              onChange={(e) => updateField("question", e.target.value)}
            />
          </>
        );
      }

      case "quote": {
        const quoteSection = editingSection as Section & {
          author?: string;
          source?: string;
          content?: string;
        };
        return (
          <>
            <TextField
              fullWidth
              label="Author"
              value={quoteSection.author || ""}
              onChange={(e) => updateField("author", e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Source"
              value={quoteSection.source || ""}
              onChange={(e) => updateField("source", e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={quoteSection.content || ""}
              onChange={(e) => updateField("content", e.target.value)}
            />
          </>
        );
      }

      case "discussion_questions": {
        const discussionSection = editingSection as Section & {
          questions?: string[];
        };
        return (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Discussion Questions
            </Typography>
            {(discussionSection.questions || []).map(
              (question: string, index: number) => (
                <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={question}
                    onChange={(e) =>
                      updateArrayItem("questions", index, e.target.value)
                    }
                    placeholder="Enter discussion question..."
                  />
                  <IconButton
                    onClick={() => removeArrayItem("questions", index)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              )
            )}
            <Button
              startIcon={<Plus />}
              onClick={() => addArrayItem("questions", "")}
              variant="outlined"
              size="small"
            >
              Add Question
            </Button>
          </>
        );
      }

      default:
        return null;
    }
  };

  if (isAddMode && !isEditing) {
    return (
      <Card
        variant="outlined"
        sx={{ border: "2px dashed", borderColor: "grey.300" }}
      >
        <CardContent sx={{ textAlign: "center", py: 3 }}>
          <Button
            startIcon={<Plus />}
            onClick={() => setIsEditing(true)}
            variant="outlined"
          >
            Add New Section
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isEditing && section) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Chip
              label={section.type.replace("_", " ")}
              color="primary"
              size="small"
            />
            <Box>
              <IconButton size="small" onClick={() => setIsEditing(true)}>
                <Edit size={16} />
              </IconButton>
              <IconButton size="small" onClick={onRemove} color="error">
                <Trash2 size={16} />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {section.type === "paragraph" &&
              (section as any).content?.substring(0, 100) + "..."}
            {section.type === "reading" && `Reading: ${(section as any).label}`}
            {section.type === "memory_verse" && `${(section as any).label}`}
            {section.type === "bible_question" &&
              `Question: ${(section as any).label}`}
            {section.type === "quote" && `Quote by ${(section as any).author}`}
            {section.type === "discussion_questions" &&
              `${(section as any).questions?.length || 0} discussion questions`}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        {isAddMode && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Section Type</InputLabel>
            <Select
              value={editingSection.type}
              label="Section Type"
              onChange={(e) => {
                const newType = e.target.value as SectionType;
                setEditingSection({ type: newType } as Section);
              }}
            >
              <MenuItem value="paragraph">Paragraph</MenuItem>
              <MenuItem value="reading">Reading</MenuItem>
              <MenuItem value="memory_verse">Memory Verse</MenuItem>
              <MenuItem value="bible_question">Bible Question</MenuItem>
              <MenuItem value="quote">Quote</MenuItem>
              <MenuItem value="discussion_questions">
                Discussion Questions
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {renderSectionForm()}
      </CardContent>

      <CardActions>
        <Button onClick={handleSave} variant="contained" size="small">
          {isAddMode ? "Add Section" : "Save"}
        </Button>
        <Button onClick={handleCancel} size="small">
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
}
