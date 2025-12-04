import React from 'react';
import { cn } from '../utils/cn';

/* ========================================
   AVATAR COMPONENT
   User profile images with fallback
   ======================================== */

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  ring?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  ring,
  className,
  ...props
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 bottom-0 right-0',
    sm: 'w-2 h-2 bottom-0 right-0',
    md: 'w-2.5 h-2.5 bottom-0 right-0',
    lg: 'w-3 h-3 bottom-0.5 right-0.5',
    xl: 'w-4 h-4 bottom-0.5 right-0.5',
    '2xl': 'w-5 h-5 bottom-1 right-1',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500',
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-pink-100 text-pink-700',
  ];

  const getColorFromName = (name?: string) => {
    if (!name) return colors[0];
    const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    return colors[charCode % colors.length];
  };

  return (
    <div className={cn('relative inline-block', className)} {...props}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center font-medium',
          sizes[size],
          ring && 'ring-2 ring-white',
          !src && getColorFromName(name)
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      
      {status && (
        <span
          className={cn(
            'absolute rounded-full ring-2 ring-white',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

/* Avatar Group */
interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
  children: React.ReactNode;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max = 4,
  size = 'md',
  children,
  className,
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);
  const excess = childrenArray.length - max;
  const visibleChildren = childrenArray.slice(0, max);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="relative" style={{ zIndex: max - index }}>
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size, ring: true })
            : child}
        </div>
      ))}
      
      {excess > 0 && (
        <div
          className={cn(
            'relative rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600 ring-2 ring-white',
            sizes[size]
          )}
          style={{ zIndex: 0 }}
        >
          +{excess}
        </div>
      )}
    </div>
  );
};

export { Avatar, AvatarGroup };
