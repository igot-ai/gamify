'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'gaming' | 'standard';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'gaming', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full text-sm font-medium text-foreground',
          'placeholder:text-muted-foreground/60 placeholder:font-normal',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          variant === 'gaming' ? 'input-gaming' : 'input-standard',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
