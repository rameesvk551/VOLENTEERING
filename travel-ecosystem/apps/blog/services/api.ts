/**
 * API Client
 * Purpose: HTTP client for backend API communication
 * Architecture: Fetch-based API service with error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const resolveAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface Author {
  id: string;
  name: string;
  email: string;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: string[];
  averageRating: number;
  totalRatings: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  canonicalUrl?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  limit: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface CategoryMeta {
  name: string;
  count: number;
}

interface TagMeta {
  name: string;
  count: number;
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
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tag) searchParams.set('tags', params.tag);
  if (params?.search) searchParams.set('search', params.search);

  if (params?.sort) {
    const sortMap: Record<string, string> = {
      date: '-publishedAt',
      title: 'title',
      popular: '-views',
    };
    searchParams.set('sort', sortMap[params.sort] || params.sort);
  }

  const queryString = searchParams.toString();
  const url = `/blog${queryString ? `?${queryString}` : ''}`;

  const response = await fetchAPI<{
    success: boolean;
    data: { blogs: Post[]; pagination: PaginationMeta };
    message?: string;
  }>(url);

  const { blogs, pagination } = response.data;

  return {
    data: blogs,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalPosts: pagination.totalBlogs,
      hasNext: pagination.currentPage < pagination.totalPages,
      hasPrev: pagination.currentPage > 1,
    },
  };
}

/**
 * Get single post by slug
 */
export async function getPostBySlug(slug: string): Promise<{ blog: Post; jsonLd?: unknown }> {
  const response = await fetchAPI<{
    success: boolean;
    data: { blog: Post; jsonLd?: unknown };
    message?: string;
  }>(`/blog/${slug}`);

  return {
    blog: response.data.blog,
    jsonLd: response.data.jsonLd,
  };
}

/**
 * Get single post by ID
 */
export async function getPostById(id: string): Promise<Post> {
  const response = await fetchAPI<{
    success: boolean;
    data: { blog: Post };
    message?: string;
  }>(`/blog/id/${id}`);

  return response.data.blog;
}

/**
 * Create new post (Admin)
 */
export async function createPost(postData: Partial<Post>): Promise<Post> {
  const response = await fetchAPI<{
    success: boolean;
    data: { blog: Post };
    message?: string;
  }>('/blog', {
    method: 'POST',
    headers: resolveAuthHeaders(),
    body: JSON.stringify(postData),
  });

  return response.data.blog;
}

/**
 * Update post (Admin)
 */
export async function updatePost(id: string, postData: Partial<Post>): Promise<Post> {
  const response = await fetchAPI<{
    success: boolean;
    data: { blog: Post };
    message?: string;
  }>(`/blog/${id}`, {
    method: 'PUT',
    headers: resolveAuthHeaders(),
    body: JSON.stringify(postData),
  });

  return response.data.blog;
}

/**
 * Delete post (Admin)
 */
export async function deletePost(id: string): Promise<void> {
  await fetchAPI(`/blog/${id}`, {
    method: 'DELETE',
    headers: resolveAuthHeaders(),
  });
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<CategoryMeta[]> {
  const response = await fetchAPI<{
    success: boolean;
    data: { categories: Array<{ _id: string; count: number }> };
  }>(`/blog/categories/list`);

  return response.data.categories
    .filter(category => Boolean(category._id))
    .map(category => ({
      name: category._id,
      count: category.count,
    }));
}

/**
 * Get all tags
 */
export async function getTags(): Promise<TagMeta[]> {
  const response = await fetchAPI<{
    success: boolean;
    data: { tags: Array<{ _id: string; count: number }> };
  }>(`/blog/tags/list`);

  return response.data.tags
    .filter(tag => Boolean(tag._id))
    .map(tag => ({
      name: tag._id,
      count: tag.count,
    }));
}

// Export types
export type { Post, PaginatedResponse, CategoryMeta, TagMeta };