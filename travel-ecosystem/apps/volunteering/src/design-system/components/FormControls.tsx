import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

/* ========================================
   CHECKBOX COMPONENT
   Custom styled checkbox with label
   ======================================== */

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, indeterminate, ...props }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    
    React.useImperativeHandle(ref, () => checkboxRef.current!);
    
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    return (
      <label className={cn('flex items-start gap-3 cursor-pointer group', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={checkboxRef}
            type="checkbox"
            className={cn(
              'peer w-5 h-5 rounded border-2 appearance-none cursor-pointer',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              error
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-primary-500',
              'checked:bg-primary-500 checked:border-primary-500',
              'hover:border-gray-400 checked:hover:bg-primary-600 checked:hover:border-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
          <svg
            className={cn(
              'absolute w-3 h-3 text-white pointer-events-none opacity-0',
              'peer-checked:opacity-100 transition-opacity duration-150'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
            {error && (
              <p className="text-sm text-red-500 mt-0.5">{error}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/* ========================================
   RADIO COMPONENT
   Custom styled radio button
   ======================================== */

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <label className={cn('flex items-start gap-3 cursor-pointer group', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="radio"
            className={cn(
              'peer w-5 h-5 rounded-full border-2 appearance-none cursor-pointer',
              'transition-all duration-200 ease-out',
              'border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
              'checked:border-primary-500',
              'hover:border-gray-400 checked:hover:border-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
          <span
            className={cn(
              'absolute w-2.5 h-2.5 rounded-full bg-primary-500 pointer-events-none',
              'scale-0 peer-checked:scale-100 transition-transform duration-150'
            )}
          />
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

/* ========================================
   SWITCH/TOGGLE COMPONENT
   iOS-style toggle switch
   ======================================== */

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: { track: 'w-8 h-5', thumb: 'w-4 h-4', translate: 'translate-x-3' },
      md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
      lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
    };

    const { track, thumb, translate } = sizes[size];

    return (
      <label className={cn('flex items-center gap-3 cursor-pointer group', className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'rounded-full transition-colors duration-200',
              'bg-gray-200 peer-checked:bg-primary-500',
              'peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-primary-500',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              track
            )}
          />
          <div
            className={cn(
              'absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm',
              'transition-transform duration-200',
              `peer-checked:${translate}`,
              thumb
            )}
          />
        </div>
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {label}
              </span>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Checkbox, Radio, Switch };
