import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 focus:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-[#e8f0fe] text-[#1a73e8]',
        secondary: 'bg-[#f1f3f4] text-[#5f6368]',
        destructive: 'bg-[#fce8e6] text-[#d93025]',
        outline: 'border border-[#dadce0] bg-white text-[#5f6368]',
        success: 'bg-[#e6f4ea] text-[#1e8e3e]',
        warning: 'bg-[#fef7e0] text-[#f9ab00]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };


