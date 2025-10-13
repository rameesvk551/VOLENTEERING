/**
 * General Helper Utilities
 * Purpose: Common utility functions used across the backend
 * Architecture: Reusable helper functions for data transformation
 *
 * Provides:
 * - Date formatting
 * - String manipulation
 * - Array utilities
 * - Response formatting
 */

/**
 * Format date to readable string
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  // TODO: Implement with date-fns or moment
  return date.toISOString().split('T')[0];
};

/**
 * Parse date from string
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Remove duplicate items from array
 */
export const uniqueArray = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

/**
 * Sort array of objects by key
 */
export const sortByKey = <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return arr.sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Paginate array
 */
export const paginate = <T>(
  arr: T[],
  page: number = 1,
  limit: number = 10
): { data: T[]; pagination: PaginationInfo } => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const data = arr.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(arr.length / limit),
      totalItems: arr.length,
      itemsPerPage: limit,
      hasNext: endIndex < arr.length,
      hasPrev: page > 1,
    },
  };
};

/**
 * Pagination info interface
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Success response formatter
 */
export const successResponse = <T>(data: T, message?: string) => {
  return {
    status: 'success',
    message,
    data,
  };
};

/**
 * Error response formatter
 */
export const errorResponse = (message: string, statusCode: number = 500) => {
  return {
    status: 'error',
    statusCode,
    message,
  };
};

/**
 * Delay/sleep utility
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
