/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Button,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Scissors, Eye, EyeOff, Zap, FileText, Hash } from "lucide-react";
import type {
  MarkdownBlock,
  ParsedStructure,
  SplitMarker,
} from "../types/markdown-parser";
import { MarkdownPreview } from "./markdown-preview";
import { MarkdownEditor } from "./markdown-editor";

interface MarkdownParserProps {
  rawMarkdown: string;
  onMarkdownChange: (content: string) => void;
  onBlocksGenerated: (blocks: MarkdownBlock[]) => void;
}

// Helper functions moved outside component to avoid initialization issues
const detectBlockType = (content: string): MarkdownBlock["type"] => {
  if (content.startsWith("#")) return "heading";
  if (content.startsWith(">")) return "quote";
  if (
    content.startsWith("-") ||
    content.startsWith("*") ||
    /^\d+\./.test(content)
  )
    return "list";
  if (/\*\*(.+?)\*\*/g.test(content)) return "bold";
  if (/\*(.+?)\*/g.test(content)) return "italic";
  return "paragraph";
};

const detectPotentialSections = (blocks: MarkdownBlock[]) => {
  const sections: Array<{
    type: string;
    blocks: MarkdownBlock[];
    confidence: number;
  }> = [];

  blocks.forEach((block, index) => {
    const content = block.content.toLowerCase();

    // Memory verse detection
    if (content.includes("memorizar") || content.includes("memory verse")) {
      sections.push({
        type: "memory_verse",
        blocks: [block],
        confidence: 0.9,
      });
    }

    // Reading section detection
    if (content.includes("lee para") || content.includes("read for")) {
      sections.push({
        type: "reading",
        blocks: [block],
        confidence: 0.8,
      });
    }

    // Quote detection
    if (
      block.type === "quote" ||
      content.includes("elena") ||
      content.includes("white")
    ) {
      sections.push({
        type: "quote",
        blocks: [block],
        confidence: 0.7,
      });
    }

    // Question detection
    if (content.includes("?") && content.length < 200) {
      sections.push({
        type: "bible_question",
        blocks: [block],
        confidence: 0.6,
      });
    }
  });

  return sections;
};

export function MarkdownParser({
  rawMarkdown,
  onMarkdownChange,
  onBlocksGenerated,
}: MarkdownParserProps) {
  const [splitMarkers, setSplitMarkers] = useState<SplitMarker[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState<number | null>(null);

  // Parse markdown structure
  const parsedStructure = useMemo((): ParsedStructure => {
    const lines = rawMarkdown.split("\n");
    const blocks: MarkdownBlock[] = [];
    const headings: Array<{ level: number; text: string; position: number }> =
      [];

    let currentBlock = "";
    let blockIndex = 0;

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();

      // Detect headings
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        // Save previous block if exists
        if (currentBlock.trim()) {
          blocks.push({
            id: `block-${blockIndex++}`,
            content: currentBlock.trim(),
            type: detectBlockType(currentBlock.trim()),
            originalIndex: blockIndex,
            isAssigned: false,
          });
          currentBlock = "";
        }

        // Add heading
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        headings.push({ level, text, position: lineIndex });

        blocks.push({
          id: `block-${blockIndex++}`,
          content: trimmedLine,
          type: "heading",
          level,
          originalIndex: blockIndex,
          isAssigned: false,
          metadata: {
            isDate: /\d{4}-\d{2}-\d{2}/.test(text),
            isMemoryVerse: /memorizar|memory verse/i.test(text),
          },
        });
      } else if (trimmedLine) {
        currentBlock += line + "\n";
      } else if (currentBlock.trim()) {
        // Empty line - end current block
        const content = currentBlock.trim();
        const type = detectBlockType(content);

        blocks.push({
          id: `block-${blockIndex++}`,
          content,
          type,
          originalIndex: blockIndex,
          isAssigned: false,
          metadata: {
            isBold: /\*\*(.+?)\*\*/g.test(content),
            isItalic: /\*(.+?)\*/g.test(content),
            isQuestion: /\?/.test(content),
            isQuote: content.startsWith(">") || /[""]/.test(content),
          },
        });
        currentBlock = "";
      }
    });

    // Add final block if exists
    if (currentBlock.trim()) {
      blocks.push({
        id: `block-${blockIndex++}`,
        content: currentBlock.trim(),
        type: detectBlockType(currentBlock.trim()),
        originalIndex: blockIndex,
        isAssigned: false,
      });
    }

    // Detect potential sections
    const potentialSections = detectPotentialSections(blocks);

    return { blocks, headings, potentialSections };
  }, [rawMarkdown]);

  // Add split marker at heading
  const addSplitAtHeading = useCallback(
    (headingIndex: number) => {
      const heading = parsedStructure.headings[headingIndex];
      const newMarker: SplitMarker = {
        position: heading.position,
        type: "heading",
        content: heading.text,
      };

      setSplitMarkers((prev) => {
        const exists = prev.some(
          (marker) => marker.position === newMarker.position
        );
        if (exists) return prev;
        return [...prev, newMarker].sort((a, b) => a.position - b.position);
      });
    },
    [parsedStructure.headings]
  );

  // Auto-detect and split by H3 (daily sections)
  const autoSplit = useCallback(() => {
    const newMarkers: SplitMarker[] = [];

    // Store H2 for potential lesson title (not split marker, but metadata)
    const lessonTitleHeading = parsedStructure.headings.find(
      (h) => h.level === 2
    );

    // Create splits at H3 headings which indicate daily sections
    parsedStructure.headings.forEach((heading) => {
      if (heading.level === 3) {
        newMarkers.push({
          position: heading.position,
          type: "heading",
          content: heading.text,
        });
      }
    });

    setSplitMarkers(newMarkers);
  }, [parsedStructure.headings]);

  // Generate blocks from current markdown and split markers
  const generateBlocks = useCallback(() => {
    const blocks = parsedStructure.blocks.map((block) => ({
      ...block,
      metadata: {
        ...block.metadata,
        // Enhanced detection based on content
        isMemoryVerse: /memorizar|memory verse|para memorizar/i.test(
          block.content
        ),
        isQuestion: /\?/.test(block.content) && block.content.length < 300,
        isQuote:
          block.content.includes('"') ||
          block.content.includes('"') ||
          block.content.includes('"'),
      },
    }));

    onBlocksGenerated(blocks);
  }, [parsedStructure.blocks, onBlocksGenerated]);

  return (
    <Grid container spacing={3}>
      {/* Markdown Editor */}
      <Grid item xs={12} lg={6}>
        <Paper sx={{ p: 3, height: "700px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              <FileText className="inline mr-2" size={20} />
              Raw Markdown
            </Typography>
            <Box>
              <Tooltip title="Auto-detect splits">
                <IconButton onClick={autoSplit} size="small">
                  <Zap />
                </IconButton>
              </Tooltip>
              <Tooltip title={showPreview ? "Show editor" : "Show preview"}>
                <IconButton
                  onClick={() => setShowPreview(!showPreview)}
                  size="small"
                >
                  {showPreview ? <EyeOff /> : <Eye />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {showPreview ? (
            <MarkdownPreview content={rawMarkdown} />
          ) : (
            <MarkdownEditor content={rawMarkdown} onChange={onMarkdownChange} />
          )}
        </Paper>
      </Grid>

      {/* Structure Analysis */}
      <Grid item xs={12} lg={6}>
        <Paper sx={{ p: 3, height: "700px", overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            <Hash className="inline mr-2" size={20} />
            Structure Analysis
          </Typography>

          {/* Headings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detected Headings ({parsedStructure.headings.length})
            </Typography>
            <List dense>
              {parsedStructure.headings.map((heading, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton
                    onClick={() => addSplitAtHeading(index)}
                    selected={selectedHeading === index}
                    sx={{ py: 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip label={`H${heading.level}`} size="small" />
                          <Typography variant="body2">
                            {heading.text}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton size="small">
                      <Scissors size={16} />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Potential Sections */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Potential Sections ({parsedStructure.potentialSections.length})
            </Typography>
            {parsedStructure.potentialSections.map((section, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Chip
                  label={section.type.replace("_", " ")}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`${Math.round(section.confidence * 100)}% confidence`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Split Markers */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Split Markers ({splitMarkers.length})
            </Typography>
            {splitMarkers.map((marker, index) => (
              <Chip
                key={index}
                label={marker.content}
                onDelete={() =>
                  setSplitMarkers((prev) => prev.filter((_, i) => i !== index))
                }
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              onClick={generateBlocks}
              startIcon={<Scissors />}
            >
              Generate Blocks ({parsedStructure.blocks.length})
            </Button>
            <Button variant="outlined" onClick={autoSplit} startIcon={<Zap />}>
              Auto-Split
            </Button>
          </Box>

          {parsedStructure.blocks.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Ready to generate {parsedStructure.blocks.length} content blocks.
              Click "Generate Blocks" to proceed to the Section Builder.
            </Alert>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
