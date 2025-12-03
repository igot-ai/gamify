'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ConfigFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
}

export function ConfigFormSection({
  title,
  description,
  children,
  defaultOpen = true,
  collapsible = true,
  className = '',
  headerActions,
}: ConfigFormSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className={cn(
        'border-b border-border pb-6 last:border-b-0 last:pb-0',
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {headerActions}
        </div>
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className={cn(
      'border-b border-border pb-6 last:border-b-0 last:pb-0',
      className
    )}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-4">
          <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer transition-all hover:text-primary -ml-1 pl-1 pr-3 py-1 rounded-md">
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-all duration-200',
                isOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
            <div className="text-left">
              <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
          </CollapsibleTrigger>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
        <CollapsibleContent className="animate-slide-up">
          <div>{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
