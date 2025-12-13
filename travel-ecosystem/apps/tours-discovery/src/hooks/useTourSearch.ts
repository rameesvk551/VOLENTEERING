import { useEffect, useCallback } from 'react';
import { useTourStore } from '../store/tourStore';
import { tourApi } from '../services/tourApi.service';
import { TourSearchFilters } from '../types/tour.types';

/**
 * Custom hook for tour search
 */
export const useTourSearch = () => {
  const {
    tours,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    filters,
    setTours,
    setLoading,
    setError,
    setFilters,
    resetFilters,
    setCurrentPage,
  } = useTourStore();

  /**
   * Execute search
   */
  const search = useCallback(async () => {
    // Don't search if no location is specified
    if (!filters.location?.trim()) {
      setTours([], 0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await tourApi.searchTours(filters, currentPage, pageSize);
      
      if (response.success) {
        setTours(response.data.tours, response.data.total);
      } else {
        setError('Failed to search tours');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while searching');
      setTours([], 0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize, setTours, setLoading, setError]);

  /**
   * Update filters
   */
  const updateFilters = useCallback(
    (newFilters: Partial<TourSearchFilters>) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  /**
   * Change page
   */
  const changePage = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  /**
   * Auto-search when filters or page changes
   */
  useEffect(() => {
    if (filters.location?.trim()) {
      search();
    }
  }, [filters, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tours,
    total,
    loading,
    error,
    currentPage,
    pageSize,
    filters,
    totalPages: Math.ceil(total / pageSize),
    updateFilters,
    clearFilters,
    changePage,
    search,
  };
};
