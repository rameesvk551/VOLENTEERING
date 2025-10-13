/**
 * Tag Component
 * Purpose: Display individual tag with optional click handler
 * Architecture: Reusable UI component
 */

import React from 'react';

interface TagProps {
  name: string;
  onClick?: (tag: string) => void;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Tag: React.FC<TagProps> = ({ name, onClick, variant = 'default', size = 'md' }) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    primary: 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-900 dark:text-secondary-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
    onClick ? 'cursor-pointer' : ''
  }`;

  return (
    <span className={className} onClick={() => onClick?.(name)}>
      #{name}
    </span>
  );
};

export default Tag;