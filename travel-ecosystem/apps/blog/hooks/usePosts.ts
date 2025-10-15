/**
 * usePosts Hook
 * Purpose: Fetch and manage blog posts with pagination and filtering
 * Architecture: Custom React hook for data fetching
 */

import { useState, useEffect } from 'react';
import { getPosts, getPostBySlug, type Post, type PaginatedResponse } from '../services/api';

interface UsePostsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort?: 'date' | 'title' | 'popular';
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  refetch: () => void;
}

/**
 * Hook to fetch multiple posts with pagination and filtering
 */
export const usePosts = (params?: UsePostsParams): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePostsReturn['pagination']>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPosts(params);
      setPosts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [
    params?.page,
    params?.limit,
    params?.category,
    params?.tag,
    params?.search,
    params?.sort,
  ]);

  return {
    posts,
    loading,
    error,
    pagination,
    refetch: fetchPosts,
  };
};

/**
 * Hook to fetch a single post by slug
 */
export const usePost = (slug: string) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPostBySlug(slug);
        setPost(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  return { post, loading, error };
};