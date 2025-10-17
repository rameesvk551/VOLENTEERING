/**
 * API Client
 * Purpose: HTTP client for backend API communication
 * Architecture: Fetch-based API service with error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface Post {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  categories: string[];
  publishDate: string;
  views: number;
  readingTime: number;
}

interface PaginatedResponse<T> {
  status: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

/**
 * Fetch wrapper with error handling
 */
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get all posts with filtering and pagination
 */
export async function getPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort?: 'date' | 'title' | 'popular';
}): Promise<PaginatedResponse<Post>> {
  const queryString = new URLSearchParams(
    Object.entries(params || {})
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  ).toString();

  const url = `/posts${queryString ? `?${queryString}` : ''}`;
  return fetchAPI<PaginatedResponse<Post>>(url);
}

/**
 * Get single post by slug
 */
export async function getPostBySlug(slug: string): Promise<ApiResponse<Post>> {
  return fetchAPI<ApiResponse<Post>>(`/posts/${slug}`);
}

/**
 * Get single post by ID
 */
export async function getPostById(id: string): Promise<ApiResponse<Post>> {
  return fetchAPI<ApiResponse<Post>>(`/posts/id/${id}`);
}

/**
 * Create new post (Admin)
 */
export async function createPost(postData: Partial<Post>): Promise<ApiResponse<Post>> {
  return fetchAPI<ApiResponse<Post>>('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

/**
 * Update post (Admin)
 */
export async function updatePost(id: string, postData: Partial<Post>): Promise<ApiResponse<Post>> {
  return fetchAPI<ApiResponse<Post>>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
}

/**
 * Delete post (Admin)
 */
export async function deletePost(id: string): Promise<ApiResponse<null>> {
  return fetchAPI<ApiResponse<null>>(`/posts/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
  return fetchAPI<ApiResponse<Array<{ name: string; count: number }>>>('/posts/meta/categories');
}

/**
 * Get all tags
 */
export async function getTags(): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
  return fetchAPI<ApiResponse<Array<{ name: string; count: number }>>>('/posts/meta/tags');
}

// Export types
export type { Post, PaginatedResponse, ApiResponse };