export const DEFAULT_PRIORITY = 5;
const PRIORITY_MIN = 1;
const PRIORITY_MAX = 10;

/**
 * Normalize any priority input to the inclusive 1-10 range expected by the backend.
 * Falls back to DEFAULT_PRIORITY when the value is undefined or invalid.
 */
export function normalizePriority(value?: number | null, fallback: number = DEFAULT_PRIORITY): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  const rounded = Math.round(value);
  if (rounded < PRIORITY_MIN) {
    return PRIORITY_MIN;
  }
  if (rounded > PRIORITY_MAX) {
    return PRIORITY_MAX;
  }
  return rounded;
}
