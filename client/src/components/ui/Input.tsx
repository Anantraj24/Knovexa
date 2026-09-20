import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-surface-elevated text-text-primary placeholder:text-text-muted text-sm rounded-input border border-border px-3 py-2 transition-colors duration-fast focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-surface-muted',
                leftIcon && 'pl-9',
                rightIcon && 'pr-9',
                error && 'border-status-error focus:ring-status-error focus:border-status-error',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-text-muted pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
