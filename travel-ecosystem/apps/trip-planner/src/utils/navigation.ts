const TRIP_PLANNER_SEGMENT = '/trip-planner';

const normalizePath = (value: string) => value.replace(/\/+$/, '');

const getCustomBase = () => {
  if (typeof window === 'undefined') return undefined;
  const custom = (window as unknown as { __TRIP_PLANNER_BASE_PATH__?: string })?.__TRIP_PLANNER_BASE_PATH__;
  if (typeof custom === 'string' && custom.trim().length > 0) {
    return normalizePath(custom.trim());
  }
  return undefined;
};

export const getTripPlannerBasePath = () => {
  if (typeof window === 'undefined') {
    const envBase = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
    return envBase && envBase !== '.' ? envBase : '';
  }

  const customBase = getCustomBase();
  if (customBase) return customBase;

  const { pathname } = window.location;
  const matchIndex = pathname.indexOf(TRIP_PLANNER_SEGMENT);
  if (matchIndex !== -1) {
    return pathname.slice(0, matchIndex + TRIP_PLANNER_SEGMENT.length);
  }

  const envBase = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  if (envBase && envBase !== '.') {
    return envBase;
  }

  return '';
};

export const buildTripPlannerPath = (target: string) => {
  const base = getTripPlannerBasePath();
  const cleanedTarget = target.replace(/^\/+/, '');
  if (!base) {
    return `/${cleanedTarget}`;
  }
  return `${normalizePath(base)}/${cleanedTarget}`;
};
