'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default:
          'bg-[#1a73e8] text-white hover:bg-[#1557b0] hover:shadow-[0_1px_3px_1px_rgba(60,64,67,0.15)]',
        destructive:
          'bg-[#d93025] text-white hover:bg-[#b3261e] hover:shadow-[0_1px_3px_1px_rgba(60,64,67,0.15)]',
        outline:
          'border border-[#dadce0] bg-white text-[#1a73e8] hover:bg-[#f8f9fa] hover:border-[#1a73e8]/30',
        secondary:
          'bg-white text-[#5f6368] border border-[#dadce0] hover:bg-[#f1f3f4] hover:text-[#202124]',
        ghost:
          'text-[#5f6368] hover:bg-[#f1f3f4] hover:text-[#202124]',
        link:
          'text-[#1a73e8] underline-offset-4 hover:underline',
        dark:
          'bg-[#3c4043] text-white hover:bg-[#5f6368]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
