'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

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
      <Card className={`border-border/30 shadow-stripe-sm transition-all hover:shadow-stripe-md ${className}`}>
        <CardHeader className="pb-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
              {description && <CardDescription className="mt-1.5 text-sm">{description}</CardDescription>}
            </div>
            {headerActions}
          </div>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-border/30 shadow-stripe-sm transition-all hover:shadow-stripe-md ${className}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-5">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-3 cursor-pointer transition-all hover:bg-muted/30 rounded-md -ml-2 pl-2 pr-4 py-1">
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-all duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'
                  }`}
              />
              <div className="text-left">
                <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
                {description && <CardDescription className="mt-1.5 text-sm">{description}</CardDescription>}
              </div>
            </CollapsibleTrigger>
            {headerActions && (
              <div className="flex items-center gap-2">{headerActions}</div>
            )}
          </div>
        </CardHeader>
        <CollapsibleContent className="animate-slide-up">
          <CardContent className="pt-0 pb-6">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

