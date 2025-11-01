import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { BlogPost, PaginatedResponse } from '@/types';

interface BlogState {
  posts: BlogPost[];
  currentPost: BlogPost | null;
  categories: string[];
  tags: string[];
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: BlogState = {
  posts: [],
  currentPost: null,
  categories: [],
  tags: [],
  loading: false,
  error: null,
  total: 0,
};

export const fetchPosts = createAsyncThunk('blog/fetchPosts', async (params?: any) => {
  const response = await api.get('/blog/posts', { params });
  // Backend returns: { success: true, data: { blogs: [], pagination: {...} } }
  return response.data.data;
});

export const fetchPostById = createAsyncThunk('blog/fetchPostById', async (id: string) => {
  const response = await api.get<BlogPost>(`/blog/posts/${id}`);
  return response.data;
});

export const createPost = createAsyncThunk('blog/createPost', async (post: Partial<BlogPost>) => {
  const response = await api.post<BlogPost>('/blog/posts', post);
  return response.data;
});

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ id, data }: { id: string; data: Partial<BlogPost> }) => {
    const response = await api.put<BlogPost>(`/blog/posts/${id}`, data);
    return response.data;
  }
);

export const deletePost = createAsyncThunk('blog/deletePost', async (id: string) => {
  await api.delete(`/blog/posts/${id}`);
  return id;
});

export const publishPost = createAsyncThunk('blog/publishPost', async (id: string) => {
  const response = await api.post<BlogPost>(`/blog/posts/${id}/publish`);
  return response.data;
});

export const fetchCategories = createAsyncThunk('blog/fetchCategories', async () => {
  const response = await api.get<string[]>('/blog/categories');
  return response.data;
});

export const fetchTags = createAsyncThunk('blog/fetchTags', async () => {
  const response = await api.get<string[]>('/blog/tags');
  return response.data;
});

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { blogs: [], pagination: { totalBlogs: ... } }
        state.posts = action.payload.blogs || [];
        state.total = action.payload.pagination?.totalBlogs || 0;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentPost = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
      })
      .addCase(publishPost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload;
      });
  },
});

export default blogSlice.reducer;
