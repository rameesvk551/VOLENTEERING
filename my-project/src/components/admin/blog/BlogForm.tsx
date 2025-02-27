import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Button, Typography, Box, CircularProgress } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import RichTextEditor from "../../../pages/admin/blog/RichTextEditor";
import { BlogFormData } from "../../../pages/admin/blog/types";
import axios from "axios";
import server from "../../../server/app";

// Define validation schema
const schema = yup.object().shape({
  title: yup.string().required("Title is required").min(5, "Title must be at least 5 characters"),
  content: yup.string().required("Content cannot be empty"),
});

const BlogForm: React.FC = () => {
  const { handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<BlogFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: BlogFormData) => {
    try {
      console.log("crrreating blog",data);
      
     await axios.post(`${server}/blog/create-blog`,data,{withCredentials:true})
      alert("Blog created successfully!");
      reset();
    } catch (error) {
      console.error("Error creating blog:", error);
      alert("Failed to create blog");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Typography variant="h4" textAlign="center">Create Blog</Typography>

      {/* Title Input */}
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Title" fullWidth margin="normal" error={!!errors.title} helperText={errors.title?.message} />
        )}
      />

    

      {/* Rich Text Editor */}
      <Controller
        name="content"
        control={control}
        render={({ field }) => <RichTextEditor {...field} error={!!errors.content} />}
      />
      {errors.content && <Typography color="error">{errors.content.message}</Typography>}

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
        {isSubmitting ? <CircularProgress size={24} /> : "Create Blog"}
      </Button>
    </Box>
  );
};

export default BlogForm;
