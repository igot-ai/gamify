'use client';

import { cn } from '@/lib/utils';

interface ReadOnlyFieldProps {
  label: string;
  value: string | number | boolean | null | undefined;
  className?: string;
  valueClassName?: string;
}

export function ReadOnlyField({
  label,
  value,
  className,
  valueClassName,
}: ReadOnlyFieldProps) {
  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground italic">Not set</span>;
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div
        className={cn(
          'text-sm font-medium text-foreground py-2 px-3 bg-muted/30 rounded-md border border-border/50',
          valueClassName
        )}
      >
        {displayValue()}
      </div>
    </div>
  );
}

interface ReadOnlyFieldGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ReadOnlyFieldGroup({ children, className }: ReadOnlyFieldGroupProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  );
}


