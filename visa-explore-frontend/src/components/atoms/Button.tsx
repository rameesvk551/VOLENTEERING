import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Button Component - Atomic Design Pattern
 *
 * A fully accessible, animated button component with multiple variants and states.
 * Follows WCAG 2.2 AA standards and includes loading, disabled, and focus states.
 *
 * @example
 * <Button variant="primary" size="md" leftIcon={<Icon />} onClick={handleClick}>
 *   Click me
 * </Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = 'md',
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Variant styles with proper contrast ratios
    const variants = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md focus:ring-primary-500',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      outline:
        'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-primary-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-800',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md focus:ring-red-500',
      success:
        'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-md focus:ring-green-500',
    };

    // Size styles
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    };

    // Border radius
    const roundedStyles = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-medium',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',

          // Variant styles
          variants[variant],

          // Size styles
          sizes[size],

          // Border radius
          roundedStyles[rounded],

          // Full width
          fullWidth && 'w-full',

          // Loading state
          isLoading && 'cursor-wait',

          // Custom className
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button text */}
        {children}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {/* Screen reader text for loading state */}
        {isLoading && <span className="sr-only">Loading...</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
