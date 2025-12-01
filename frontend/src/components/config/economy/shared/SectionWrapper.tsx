'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onAdd?: () => void;
  onClearAll?: () => void;
  /** Callback to save the section */
  onSave?: () => void;
  /** Whether the section is currently saving */
  isSaving?: boolean;
  addButtonText?: string;
  itemCount?: number;
  showClearAll?: boolean;
  className?: string;
  /** Read-only mode - hides all action buttons */
  readOnly?: boolean;
}

export function SectionWrapper({
  title,
  description,
  children,
  onAdd,
  onClearAll,
  onSave,
  isSaving = false,
  addButtonText = 'Add Item',
  itemCount = 0,
  showClearAll = true,
  className,
  readOnly = false,
}: SectionWrapperProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {!readOnly && (onAdd || (showClearAll && itemCount > 0 && onClearAll)) && (
        <div className="flex items-center justify-end gap-2">
          {showClearAll && itemCount > 0 && onClearAll && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="h-9 px-3 text-muted-foreground hover:text-destructive hover:border-destructive/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
          {onAdd && (
            <Button
              type="button"
              onClick={onAdd}
              size="sm"
              className="h-9 px-4 shadow-stripe-sm transition-all hover:shadow-stripe-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="animate-fade-in">
        {children}
      </div>

      {/* Save Button */}
      {!readOnly && onSave && (
        <div className="flex items-center justify-end pt-4 border-t border-border/30">
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="h-9 shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}

