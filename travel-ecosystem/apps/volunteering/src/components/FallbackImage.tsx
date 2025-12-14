import React from 'react';
import { cn } from '@/design-system';

/* ========================================
   FALLBACK IMAGE COMPONENT
   Provides graceful image degradation
   ======================================== */

// Gradient placeholder - no text, just a subtle pattern
const DEFAULT_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22 viewBox=%220 0 400 300%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 stop-color=%22%23e2e8f0%22/%3E%3Cstop offset=%22100%25%22 stop-color=%22%23cbd5e1%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22400%22 height=%22300%22 fill=%22url(%23g)%22/%3E%3C/svg%3E';

export interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  figureClassName?: string;
}

export const FallbackImage: React.FC<FallbackImageProps> = ({
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  figureClassName,
  onError,
  children,
  ...props
}) => {
  return (
    <figure className={cn('h-full w-full overflow-hidden bg-gray-100', figureClassName)}>
      <img
        {...props}
        className={cn('h-full w-full object-cover', className)}
        onError={(event) => {
          if (onError) {
            onError(event);
          }

          if (event.currentTarget.src !== fallbackSrc && !event.defaultPrevented) {
            event.currentTarget.src = fallbackSrc;
          }
        }}
      />
      {children}
    </figure>
  );
};

export default FallbackImage;
