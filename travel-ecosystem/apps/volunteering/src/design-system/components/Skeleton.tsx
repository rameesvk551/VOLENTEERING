import React from 'react';
import { cn } from '../utils/cn';

/* ========================================
   SKELETON LOADING COMPONENTS
   Placeholder loading states
   ======================================== */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
  className,
  style,
  ...props
}) => {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse bg-gray-200',
    shimmer: 'skeleton',
    none: 'bg-gray-200',
  };

  return (
    <div
      className={cn(variantClasses[variant], animationClasses[animation], className)}
      style={{
        width: width,
        height: height || (variant === 'circular' ? width : undefined),
        ...style,
      }}
      {...props}
    />
  );
};

/* Skeleton Card */
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}>
    <Skeleton variant="rectangular" height={200} className="w-full" />
    <div className="p-4 space-y-3">
      <Skeleton width="60%" height={20} />
      <Skeleton width="100%" />
      <Skeleton width="80%" />
      <div className="flex gap-2 pt-2">
        <Skeleton width={60} height={24} variant="rounded" />
        <Skeleton width={60} height={24} variant="rounded" />
      </div>
    </div>
  </div>
);

/* Skeleton Avatar */
const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 32, md: 40, lg: 48 };
  return <Skeleton variant="circular" width={sizes[size]} height={sizes[size]} />;
};

/* Skeleton Text Block */
const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 ? '70%' : '100%'}
        height={16}
      />
    ))}
  </div>
);

/* Skeleton List Item */
const SkeletonListItem: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center gap-4 p-4', className)}>
    <SkeletonAvatar />
    <div className="flex-1 space-y-2">
      <Skeleton width="40%" height={16} />
      <Skeleton width="60%" height={12} />
    </div>
    <Skeleton width={80} height={32} variant="rounded" />
  </div>
);

export { Skeleton, SkeletonCard, SkeletonAvatar, SkeletonText, SkeletonListItem };
