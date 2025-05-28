"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  CardHeader,
} from "@mui/material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Trash2,
  Move,
  ChevronDown,
  ChevronUp,
  Wand2,
  Calendar,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Section, SectionType, WeekSchema } from "../types/lesson-schema";
import type { MarkdownBlock } from "../types/markdown-parser";

interface SectionBuilderProps {
  blocks: MarkdownBlock[];
  weekData: WeekSchema;
  onUpdateWeekData: (data: WeekSchema) => void;
  onBlocksChange: (blocks: MarkdownBlock[]) => void;
}

export function SectionBuilder({
  blocks,
  weekData,
  onUpdateWeekData,
  onBlocksChange,
}: SectionBuilderProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());
  const [bulkSectionType, setBulkSectionType] =
    useState<SectionType>("paragraph");
  const [showPreview, setShowPreview] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([0]));

  const toggleDay = (dayIndex: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayIndex)) {
      newExpanded.delete(dayIndex);
    } else {
      newExpanded.add(dayIndex);
    }
    setExpandedDays(newExpanded);
  };

  // Handle drag and drop
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(blocks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      onBlocksChange(items);
    },
    [blocks, onBlocksChange]
  );

  // Convert block to section
  const blockToSection = useCallback(
    (block: MarkdownBlock, sectionType: SectionType): Section => {
      switch (sectionType) {
        case "reading":
          return {
            type: "reading",
            label: block.content.includes("LEE PARA")
              ? block.content
              : "LEE PARA EL ESTUDIO DE ESTA SEMANA",
            references: extractBibleReferences(block.content),
          };

        case "memory_verse":
          return {
            type: "memory_verse",
            label: "PARA MEMORIZAR",
            content: block.content.replace(/^#+\s*/, "").replace(/\*\*/g, ""),
          };

        case "bible_question":
          return {
            type: "bible_question",
            label: extractQuestionLabel(block.content),
            question: extractQuestion(block.content),
          };

        case "quote":
          return {
            type: "quote",
            author: extractAuthor(block.content),
            source: extractSource(block.content),
            content: cleanQuoteContent(block.content),
          };

        case "discussion_questions":
          return {
            type: "discussion_questions",
            questions: extractQuestions(block.content),
          };

        default:
          return {
            type: "paragraph",
            content: block.content.replace(/^#+\s*/, ""),
          };
      }
    },
    []
  );

  // Helper functions for content extraction
  const extractBibleReferences = (content: string): string[] => {
    const refs = content.match(/[A-Za-z]+\s+\d+:\d+(-\d+)?/g) || [];
    return refs.length > 0 ? refs : [""];
  };

  const extractQuestionLabel = (content: string): string => {
    const match = content.match(/^(.+?)\?/);
    return match ? match[1].replace(/^#+\s*/, "") : "";
  };

  const extractQuestion = (content: string): string => {
    const questionMatch = content.match(/\?[^?]*$/);
    return questionMatch ? content : content;
  };

  const extractAuthor = (content: string): string => {
    const authorMatch = content.match(/—\s*([^,]+)/);
    return authorMatch ? authorMatch[1] : "";
  };

  const extractSource = (content: string): string => {
    const sourceMatch = content.match(/—\s*[^,]+,\s*(.+)/);
    return sourceMatch ? sourceMatch[1] : "";
  };

  const cleanQuoteContent = (content: string): string => {
    return content
      .replace(/—\s*[^,]+,?\s*.*$/, "")
      .replace(/^[""]|[""]$/g, "")
      .trim();
  };

  const extractQuestions = (content: string): string[] => {
    const questions = content.split(/\d+\.\s+/).filter((q) => q.trim());
    return questions.length > 0 ? questions : [content];
  };

  // Assign block to day
  const assignBlockToDay = useCallback(
    (blockId: string, dayIndex: number, sectionType: SectionType) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      const section = blockToSection(block, sectionType);
      const newDays = [...weekData.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        sections: [...newDays[dayIndex].sections, section],
      };

      onUpdateWeekData({ ...weekData, days: newDays });

      // Mark block as assigned
      const updatedBlocks = blocks.map((b) =>
        b.id === blockId
          ? {
              ...b,
              isAssigned: true,
              assignedDay: weekData.days[dayIndex].day,
              assignedSectionType: sectionType,
            }
          : b
      );
      onBlocksChange(updatedBlocks);
    },
    [blocks, weekData, onUpdateWeekData, onBlocksChange, blockToSection]
  );

  // Bulk assign selected blocks
  const bulkAssignBlocks = useCallback(
    (dayIndex: number) => {
      selectedBlocks.forEach((blockId) => {
        assignBlockToDay(blockId, dayIndex, bulkSectionType);
      });
      setSelectedBlocks(new Set());
    },
    [selectedBlocks, bulkSectionType, assignBlockToDay]
  );

  // Auto-assign blocks based on content analysis
  const autoAssignBlocks = useCallback(() => {
    blocks.forEach((block) => {
      if (block.isAssigned) return;

      let targetDay = 0;
      let sectionType: SectionType = "paragraph";

      // Determine section type based on content
      if (block.metadata?.isMemoryVerse) {
        targetDay = 0; // Sábado
        sectionType = "memory_verse";
      } else if (block.content.toLowerCase().includes("lee para")) {
        targetDay = 0; // Sábado
        sectionType = "reading";
      } else if (block.metadata?.isQuestion) {
        targetDay = 1; // Domingo
        sectionType = "bible_question";
      } else if (block.metadata?.isQuote) {
        targetDay = 6; // Viernes
        sectionType = "quote";
      } else if (block.type === "heading" && block.metadata?.isDate) {
        // Try to match day by date or content
        const dayMatch = weekData.days.findIndex((day) =>
          block.content.toLowerCase().includes(day.day.toLowerCase())
        );
        if (dayMatch !== -1) {
          targetDay = dayMatch;
        }
      }

      assignBlockToDay(block.id, targetDay, sectionType);
    });
  }, [blocks, weekData.days, assignBlockToDay]);

  const unassignedBlocks = blocks.filter((block) => !block.isAssigned);
  const assignedBlocks = blocks.filter((block) => block.isAssigned);

  return (
    <Grid container spacing={3}>
      {/* Unassigned Blocks */}
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">
              Content Blocks ({unassignedBlocks.length} unassigned)
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                startIcon={<Wand2 />}
                onClick={autoAssignBlocks}
                variant="outlined"
                size="small"
              >
                Auto-Assign
              </Button>
              <IconButton
                onClick={() => setShowPreview(!showPreview)}
                size="small"
              >
                {showPreview ? <EyeOff /> : <Eye />}
              </IconButton>
            </Box>
          </Box>

          {/* Bulk Actions */}
          {selectedBlocks.size > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2">
                  {selectedBlocks.size} blocks selected
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Section Type</InputLabel>
                  <Select
                    value={bulkSectionType}
                    label="Section Type"
                    onChange={(e) =>
                      setBulkSectionType(e.target.value as SectionType)
                    }
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
              </Box>
            </Alert>
          )}

          {/* Blocks List */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {unassignedBlocks.map((block, index) => (
                    <Draggable
                      key={block.id}
                      draggableId={block.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            mb: 2,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                            border: selectedBlocks.has(block.id)
                              ? "2px solid"
                              : "1px solid",
                            borderColor: selectedBlocks.has(block.id)
                              ? "primary.main"
                              : "grey.300",
                          }}
                        >
                          <CardContent sx={{ pb: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                                  <Chip label={block.type} size="small" />
                                  {block.level && (
                                    <Chip
                                      label={`H${block.level}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                  {block.metadata?.isBold && (
                                    <Chip
                                      label="Bold"
                                      size="small"
                                      color="secondary"
                                    />
                                  )}
                                  {block.metadata?.isQuestion && (
                                    <Chip
                                      label="Question"
                                      size="small"
                                      color="info"
                                    />
                                  )}
                                  {block.metadata?.isQuote && (
                                    <Chip
                                      label="Quote"
                                      size="small"
                                      color="warning"
                                    />
                                  )}
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "grey.100" },
                                    p: 1,
                                    borderRadius: 1,
                                  }}
                                  onClick={() => {
                                    const newSelected = new Set(selectedBlocks);
                                    if (newSelected.has(block.id)) {
                                      newSelected.delete(block.id);
                                    } else {
                                      newSelected.add(block.id);
                                    }
                                    setSelectedBlocks(newSelected);
                                  }}
                                >
                                  {showPreview ? (
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: block.content.replace(
                                          /\n/g,
                                          "<br>"
                                        ),
                                      }}
                                    />
                                  ) : (
                                    block.content.substring(0, 200) +
                                    (block.content.length > 200 ? "..." : "")
                                  )}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <IconButton
                                  {...provided.dragHandleProps}
                                  size="small"
                                >
                                  <Move size={16} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const updatedBlocks = blocks.filter(
                                      (b) => b.id !== block.id
                                    );
                                    onBlocksChange(updatedBlocks);
                                  }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Paper>
      </Grid>

      {/* Day Assignment Panel */}
      <Grid item xs={12} lg={4}>
        <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
          <Typography variant="h6" gutterBottom>
            <Calendar className="inline mr-2" size={20} />
            Assign to Days
          </Typography>

          {weekData.days.map((day, dayIndex) => (
            <Card key={dayIndex} sx={{ mb: 1 }}>
              <CardHeader
                title={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography variant="subtitle2">{day.day}</Typography>
                    <Chip
                      label={`${day.sections.length} sections`}
                      size="small"
                    />
                  </Box>
                }
                action={
                  <IconButton onClick={() => toggleDay(dayIndex)} size="small">
                    {expandedDays.has(dayIndex) ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </IconButton>
                }
                sx={{ pb: 0 }}
              />
              {expandedDays.has(dayIndex) && (
                <CardContent sx={{ pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Plus />}
                    onClick={() => bulkAssignBlocks(dayIndex)}
                    disabled={selectedBlocks.size === 0}
                    size="small"
                  >
                    Add Selected ({selectedBlocks.size})
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Assigned Blocks Summary */}
          {assignedBlocks.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Assigned Blocks ({assignedBlocks.length})
              </Typography>
              {assignedBlocks.map((block) => (
                <Chip
                  key={block.id}
                  label={`${block.assignedDay} - ${block.assignedSectionType}`}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  onDelete={() => {
                    const updatedBlocks = blocks.map((b) =>
                      b.id === block.id
                        ? {
                            ...b,
                            isAssigned: false,
                            assignedDay: undefined,
                            assignedSectionType: undefined,
                          }
                        : b
                    );
                    onBlocksChange(updatedBlocks);
                  }}
                />
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
