/**
 * Admin API Service
 * Purpose: Handle admin-related API calls with admin microservice
 * Architecture: Service layer connecting to admin microservice (port 4000)
 */

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4000/api/admin';
const BLOG_API_URL = import.meta.env.VITE_BLOG_API_URL || 'http://localhost:4003/api/blog';

export interface CreateBlogInput {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {
  id: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`,
  };
};

const getUserId = () => {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id;
  } catch {
    return null;
  }
};

const getUserInfo = () => {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Blog Management
 */

/**
 * Get all blogs (including drafts) for admin
 */
export const getAllBlogsAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${ADMIN_API_URL}/posts?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch blogs');
  }

  return await response.json();
};

/**
 * Get blog by ID for editing
 */
export const getBlogByIdAdmin = async (id: string): Promise<any> => {
  const response = await fetch(`${ADMIN_API_URL}/posts/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch blog');
  }

  return await response.json();
};

/**
 * Create a new blog
 */
export const createBlog = async (blogData: CreateBlogInput): Promise<any> => {
  const user = getUserInfo();
  
  const response = await fetch(`${ADMIN_API_URL}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...blogData,
      author: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
      } : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create blog');
  }

  return await response.json();
};

/**
 * Update a blog
 */
export const updateBlog = async (id: string, blogData: Partial<CreateBlogInput>): Promise<any> => {
  const response = await fetch(`${ADMIN_API_URL}/posts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(blogData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update blog');
  }

  return await response.json();
};

/**
 * Delete a blog
 */
export const deleteBlog = async (id: string): Promise<void> => {
  const response = await fetch(`${ADMIN_API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete blog');
  }
};

/**
 * Publish a blog
 */
export const publishBlog = async (id: string): Promise<any> => {
  const response = await fetch(`${ADMIN_API_URL}/posts/${id}/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to publish blog');
  }

  return await response.json();
};

/**
 * Comment Management
 */

/**
 * Get all comments (including pending) for admin
 */
export const getAllCommentsAdmin = async (params?: {
  page?: number;
  limit?: number;
  blogId?: string;
  isApproved?: boolean;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.blogId) queryParams.append('blogId', params.blogId);
  if (params?.isApproved !== undefined) queryParams.append('isApproved', params.isApproved.toString());

  const response = await fetch(`${BLOG_API_URL}/comments/admin?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return await response.json();
};

/**
 * Approve a comment
 */
export const approveComment = async (commentId: string): Promise<any> => {
  const response = await fetch(`${BLOG_API_URL}/comments/${commentId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to approve comment');
  }

  return await response.json();
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  const response = await fetch(`${BLOG_API_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete comment');
  }
};

/**
 * User Management
 */

/**
 * Get all users
 */
export const getAllUsers = async (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<{ items: User[]; total: number; page: number; pageSize: number; totalPages: number }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(`${ADMIN_API_URL}/users?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return await response.json();
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  const response = await fetch(`${ADMIN_API_URL}/users/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return await response.json();
};

/**
 * Update user
 */
export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const response = await fetch(`${ADMIN_API_URL}/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }

  return await response.json();
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${ADMIN_API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }
};

/**
 * Get categories
 */
export const getCategories = async (): Promise<string[]> => {
  const response = await fetch(`${ADMIN_API_URL}/categories`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const data = await response.json();
  return data;
};

/**
 * Get tags
 */
export const getTags = async (): Promise<string[]> => {
  const response = await fetch(`${ADMIN_API_URL}/tags`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  const data = await response.json();
  return data;
};
