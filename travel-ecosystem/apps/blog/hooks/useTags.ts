/**
 * useTags Hook
 * Purpose: Retrieve blog tags metadata for filtering
 */

import { useEffect, useState, useCallback } from 'react';
import { getTags, type TagMeta } from '../services/api';

interface UseTagsReturn {
  tags: TagMeta[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTags = (): UseTagsReturn => {
  const [tags, setTags] = useState<TagMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTags();
      setTags(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tags';
      setError(message);
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
  };
};

export default useTags;
