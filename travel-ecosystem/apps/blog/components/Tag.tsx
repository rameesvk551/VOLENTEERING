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
  const baseClasses = 'inline-flex items-center rounded-md font-medium transition-colors';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
    primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/50 dark:text-primary-400',
    secondary: 'bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
    onClick ? 'cursor-pointer' : ''
  }`;

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (!onClick) {
      return;
    }

    event.stopPropagation();
    onClick(name);
  };

  return (
    <span className={className} onClick={handleClick}>
      {name}
    </span>
  );
};

export default Tag;