/**
 * useCategories Hook
 * Purpose: Retrieve blog categories with counts for dynamic filtering
 */

import { useEffect, useState, useCallback } from 'react';
import { getCategories, type CategoryMeta } from '../services/api';

interface UseCategoriesReturn {
  categories: CategoryMeta[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCategories();
      setCategories(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      setError(message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};

export default useCategories;
