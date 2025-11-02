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
  featuredImage?: string | null;
  category: string;
  tags: string[];
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
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
  // Check both possible token locations
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

  if (!token) {
    console.warn('⚠️ No authentication token found in localStorage');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Helper to decode JWT and extract user info if needed
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

const getUserId = () => {
  // Check both possible user locations
  const userStr = localStorage.getItem('user') || localStorage.getItem('auth_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || user._id;
  } catch {
    return null;
  }
};

const getUserInfo = () => {
  // Check both possible user locations
  const userStr = localStorage.getItem('user') || localStorage.getItem('auth_user');
  
  // Debug logging
  console.log('🔍 Checking localStorage for user...');
  console.log('  - localStorage.getItem("user"):', localStorage.getItem('user'));
  console.log('  - localStorage.getItem("auth_user"):', localStorage.getItem('auth_user'));
  console.log('  - localStorage.getItem("token"):', localStorage.getItem('token') ? '✓ exists' : '✗ missing');
  
  if (!userStr) {
    console.warn('⚠️ No user found in localStorage. Available keys:', Object.keys(localStorage));
    
    // Fallback: try to decode user info from JWT token
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      console.log('🔄 Attempting to extract user info from JWT token...');
      const decoded = decodeToken(token);
      if (decoded) {
        console.log('✅ Extracted user from token:', decoded);
        // JWT payload typically has: userId, email, role, etc.
        return {
          id: decoded.userId || decoded.id || decoded.sub,
          _id: decoded.userId || decoded.id || decoded.sub,
          name: decoded.name || decoded.username || 'Admin User',
          email: decoded.email || '',
          role: decoded.role || 'admin',
        };
      }
    }
    
    return null;
  }
  
  try {
    const parsed = JSON.parse(userStr);
    console.log('✅ Successfully parsed user:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ Failed to parse user from localStorage:', error);
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

  // Call blog microservice directly
  const response = await fetch(`${BLOG_API_URL}/all?${queryParams}`, {
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
  // Call blog microservice directly
  const response = await fetch(`${BLOG_API_URL}/edit/${id}`, {
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
  const payload: any = { ...blogData };

  if (user) {
    const authorId = user.id || user._id;
    if (authorId) {
      payload.author = {
        id: authorId,
        name: user.name || user.username || 'Admin',
        email: user.email || 'admin@example.com',
      };
      console.log('📝 Including author data in payload:', payload.author);
    } else {
      console.warn('⚠️ User found but missing id fields. Backend will populate author.');
    }
  } else {
    console.warn('⚠️ No user info available locally. Relying on backend headers for author data.');
  }

  console.log('📦 Full payload being sent to API:', JSON.stringify(payload, null, 2));
  
  // Call admin microservice which forwards to blog service with proper headers
  const response = await fetch(`${ADMIN_API_URL}/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ API Error Response:', error);
    throw new Error(error.message || 'Failed to create blog');
  }

  const result = await response.json();
  console.log('✅ Blog created successfully:', result);
  return result;
};

/**
 * Update a blog
 */
export const updateBlog = async (id: string, blogData: Partial<CreateBlogInput>): Promise<any> => {
  // Call blog microservice directly
  const response = await fetch(`${BLOG_API_URL}/${id}`, {
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
  // Call blog microservice directly
  const response = await fetch(`${BLOG_API_URL}/${id}`, {
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
  // Call blog microservice directly
  const response = await fetch(`${BLOG_API_URL}/${id}/publish`, {
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
