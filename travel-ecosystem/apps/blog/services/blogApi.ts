/**
 * Blog API Service
 * Purpose: Handle blog-related API calls with blog microservice
 * Architecture: Service layer connecting to blog microservice (port 4003)
 */

const BLOG_API_URL = import.meta.env.VITE_BLOG_API_URL || 'http://localhost:4003/api/blog';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: string[];
  averageRating: number;
  totalRatings: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  blogId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  content: string;
  parentCommentId?: string;
  likes: string[];
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
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

/**
 * Get all published blogs with pagination and filters
 */
export const getAllBlogs = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tags?: string;
  sort?: string;
  featured?: boolean;
}): Promise<{ blogs: Blog[]; pagination: any }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.tags) queryParams.append('tags', params.tags);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.featured) queryParams.append('featured', 'true');

  const response = await fetch(`${BLOG_API_URL}?${queryParams}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch blogs');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Get blog by slug
 */
export const getBlogBySlug = async (slug: string): Promise<Blog> => {
  const response = await fetch(`${BLOG_API_URL}/${slug}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch blog');
  }

  const data = await response.json();
  return data.data.blog;
};

/**
 * Get featured blogs
 */
export const getFeaturedBlogs = async (limit: number = 5): Promise<Blog[]> => {
  const response = await fetch(`${BLOG_API_URL}/featured?limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch featured blogs');
  }

  const data = await response.json();
  return data.data.blogs;
};

/**
 * Get popular blogs
 */
export const getPopularBlogs = async (limit: number = 10): Promise<Blog[]> => {
  const response = await fetch(`${BLOG_API_URL}/popular?limit=${limit}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch popular blogs');
  }

  const data = await response.json();
  return data.data.blogs;
};

/**
 * Toggle like on a blog
 */
export const toggleLike = async (blogId: string): Promise<{ liked: boolean; likesCount: number }> => {
  const userId = getUserId();
  
  const response = await fetch(`${BLOG_API_URL}/${blogId}/like`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'x-user-id': userId || 'anonymous',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to toggle like');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Rate a blog
 */
export const rateBlog = async (blogId: string, rating: number): Promise<any> => {
  const userId = getUserId();
  
  const response = await fetch(`${BLOG_API_URL}/${blogId}/rate`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'x-user-id': userId || '',
    },
    body: JSON.stringify({ rating }),
  });

  if (!response.ok) {
    throw new Error('Failed to rate blog');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Get comments for a blog
 */
export const getComments = async (blogId: string): Promise<Comment[]> => {
  const response = await fetch(`${BLOG_API_URL}/comments/${blogId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  const data = await response.json();
  return data.data.comments;
};

/**
 * Create a comment
 */
export const createComment = async (
  blogId: string,
  content: string,
  parentCommentId?: string
): Promise<Comment> => {
  const userId = getUserId();
  const userStr = localStorage.getItem('auth_user');
  let user = null;
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      // ignore
    }
  }

  const response = await fetch(`${BLOG_API_URL}/comments`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'x-user-id': userId || '',
    },
    body: JSON.stringify({
      blogId,
      content,
      parentCommentId,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      } : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create comment');
  }

  const data = await response.json();
  return data.data.comment;
};

/**
 * Get categories
 */
export const getCategories = async (): Promise<string[]> => {
  const response = await fetch(`${BLOG_API_URL}/categories/list`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const data = await response.json();
  return data.data.categories;
};

/**
 * Get tags
 */
export const getTags = async (): Promise<string[]> => {
  const response = await fetch(`${BLOG_API_URL}/tags/list`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  const data = await response.json();
  return data.data.tags;
};
