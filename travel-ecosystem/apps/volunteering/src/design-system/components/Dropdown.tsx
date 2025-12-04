import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

/* ========================================
   DROPDOWN COMPONENT
   Accessible dropdown menu
   ======================================== */

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[200px]',
            'bg-white rounded-xl shadow-lg border border-gray-200',
            'py-1 animate-fade-in-down',
            alignClasses[align]
          )}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
};

/* Dropdown Item */
interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  icon,
  danger,
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <div
      role="menuitem"
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer',
        'transition-colors duration-150',
        disabled
          ? 'text-gray-400 cursor-not-allowed'
          : danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-50',
        className
      )}
      {...props}
    >
      {icon && <span className="w-5 h-5 shrink-0">{icon}</span>}
      {children}
    </div>
  );
};

/* Dropdown Divider */
const DropdownDivider: React.FC = () => (
  <div className="my-1 border-t border-gray-100" />
);

/* Dropdown Label */
const DropdownLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
    {children}
  </div>
);

export { Dropdown, DropdownItem, DropdownDivider, DropdownLabel };
