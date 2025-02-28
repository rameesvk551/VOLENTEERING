import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";

interface Props {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, error }) => {
  const editor = useEditor({
    extensions: [StarterKit,Underline],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Box sx={{ mt: 2, border: "1px solid #ccc", borderRadius: "5px", padding: 2 }}>
      <Typography variant="subtitle1">Content</Typography>

      {/* Toolbar */}
      <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
        <Button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</Button>
        <Button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</Button>
        <Button onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</Button>
        <Button onClick={() => editor.chain().focus().toggleBulletList().run()}>UL</Button>
        <Button onClick={() => editor.chain().focus().toggleOrderedList().run()}>OL</Button>
      </ButtonGroup>

      {/* TipTap Editor */}
      <Box
        sx={{
          minHeight: "200px",
          border: "1px solid #ddd",
          padding: 2,
          borderRadius: "4px",
          outline: "none",
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {error && <Typography color="error">Content is required</Typography>}
    </Box>
  );
};

export default RichTextEditor;