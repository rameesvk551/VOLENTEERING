import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

/* ========================================
   BUTTON COMPONENT
   Premium, accessible button with variants
   ======================================== */

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 
   font-medium transition-all duration-200 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   active:scale-[0.98]`,
  {
    variants: {
      variant: {
        primary: `
          bg-primary-500 text-white 
          hover:bg-primary-600 
          focus-visible:ring-primary-500
          shadow-sm hover:shadow-md
        `,
        secondary: `
          bg-primary-50 text-primary-600 
          hover:bg-primary-100 
          focus-visible:ring-primary-500
        `,
        outline: `
          border-2 border-gray-200 bg-transparent text-gray-700
          hover:bg-gray-50 hover:border-gray-300
          focus-visible:ring-gray-500
        `,
        ghost: `
          bg-transparent text-gray-600
          hover:bg-gray-100 hover:text-gray-900
          focus-visible:ring-gray-500
        `,
        danger: `
          bg-red-500 text-white 
          hover:bg-red-600 
          focus-visible:ring-red-500
          shadow-sm hover:shadow-md
        `,
        success: `
          bg-emerald-500 text-white 
          hover:bg-emerald-600 
          focus-visible:ring-emerald-500
          shadow-sm hover:shadow-md
        `,
        link: `
          bg-transparent text-primary-500 underline-offset-4
          hover:underline hover:text-primary-600
          focus-visible:ring-primary-500 p-0 h-auto
        `,
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-9 px-3.5 text-sm rounded-lg',
        md: 'h-11 px-5 text-sm rounded-lg',
        lg: 'h-12 px-6 text-base rounded-xl',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/* Loading Spinner */
const LoadingSpinner = ({ size }: { size?: string | null }) => {
  const spinnerSize = size === 'xs' || size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  
  return (
    <svg
      className={cn('animate-spin', spinnerSize)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export { Button, buttonVariants };
