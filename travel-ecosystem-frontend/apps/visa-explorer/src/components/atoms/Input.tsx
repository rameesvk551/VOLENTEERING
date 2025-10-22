import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  isValid?: boolean;
  fullWidth?: boolean;
}

/**
 * Input Component - Atomic Design Pattern
 *
 * Accessible form input with validation states, icons, and password toggle.
 * Follows WCAG 2.2 AA standards with proper labels and error messaging.
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   error={errors.email}
 *   leftIcon={<MailIcon />}
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      isValid,
      fullWidth = true,
      type = 'text',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Determine input type
    const inputType = showPasswordToggle && type === 'password'
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    // Determine border color based on state
    const getBorderColor = () => {
      if (error) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
      if (success || isValid) return 'border-green-300 focus:border-green-500 focus:ring-green-500';
      if (isFocused) return 'border-primary-500 ring-2 ring-primary-100';
      return 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';
    };

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium',
              error ? 'text-red-700' : 'text-gray-700 dark:text-gray-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
            {props.required && (
              <span className="ml-1 text-red-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className={cn(
                'text-gray-400',
                error && 'text-red-400',
                (success || isValid) && 'text-green-400'
              )}>
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(
              error && errorId,
              helperText && helperId
            )}
            className={cn(
              // Base styles
              'block w-full px-3 py-2.5',
              'text-gray-900 dark:text-gray-100',
              'bg-white dark:bg-gray-800',
              'border rounded-lg',
              'transition-all duration-200',
              'placeholder:text-gray-400',

              // Focus styles
              'focus:outline-none focus:ring-2',

              // Border color
              getBorderColor(),

              // Icon padding
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle || error || success || isValid) && 'pr-10',

              // Disabled state
              disabled && 'bg-gray-50 cursor-not-allowed opacity-50',

              // Custom className
              className
            )}
            {...props}
          />

          {/* Right section (icons) */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {/* Validation icons */}
            {!rightIcon && !showPasswordToggle && (
              <>
                {error && (
                  <AlertCircle
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                )}
                {(success || isValid) && !error && (
                  <CheckCircle2
                    className="h-5 w-5 text-green-500"
                    aria-hidden="true"
                  />
                )}
              </>
            )}

            {/* Custom right icon */}
            {rightIcon && !showPasswordToggle && (
              <span className="text-gray-400">{rightIcon}</span>
            )}

            {/* Password toggle */}
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'text-gray-400 hover:text-gray-600',
                  'focus:outline-none focus:text-gray-600',
                  'transition-colors duration-200'
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Success message */}
        {success && !error && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {success}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && !success && (
          <p
            id={helperId}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
