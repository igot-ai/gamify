'use client';

import * as React from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ConfigArrayFieldProps<T> {
  title?: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onEdit?: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSummary?: (item: T, index: number) => React.ReactNode;
  addButtonText?: string;
  emptyMessage?: string;
  className?: string;
  collapsible?: boolean;
  editingIndex?: number | null;
  setEditingIndex?: (index: number | null) => void;
  showClearAll?: boolean;
  onClearAll?: () => void;
}

export function ConfigArrayField<T>({
  title,
  items,
  onAdd,
  onRemove,
  onEdit,
  renderItem,
  renderSummary,
  addButtonText = 'Add Item',
  emptyMessage = 'No items added yet',
  className = '',
  collapsible = true,
  editingIndex = null,
  setEditingIndex,
  showClearAll = false,
  onClearAll,
}: ConfigArrayFieldProps<T>): React.ReactNode {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <div className="flex gap-2">
            {showClearAll && items.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="h-9 transition-all hover:border-border/60"
              >
                Clear All
              </Button>
            )}
            <Button
              type="button"
              onClick={onAdd}
              size="sm"
              className="h-9 shadow-stripe-sm transition-all hover:shadow-stripe-md"
            >
              <Plus className="mr-2 h-4 w-4" />
              {addButtonText}
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <p className="text-sm text-muted-foreground">
            {emptyMessage}
          </p>
          <Button
            type="button"
            onClick={onAdd}
            variant="outline"
            className="mt-4 shadow-stripe-xs transition-all hover:shadow-stripe-sm"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addButtonText}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-border/30 bg-card shadow-stripe-xs p-5 transition-all hover:border-border/50 hover:shadow-stripe-sm"
            >
              {collapsible && editingIndex !== index && renderSummary ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {renderSummary(item, index)}
                  </div>
                  <div className="flex gap-2">
                    {onEdit && setEditingIndex && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(index)}
                        className="h-8 w-8 p-0 transition-all hover:bg-muted/50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(index)}
                      className="h-8 w-8 p-0 text-destructive transition-all hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {collapsible && editingIndex === index && setEditingIndex && (
                    <div className="mb-4 flex items-center justify-between">
                      <Badge variant="secondary" className="shadow-stripe-xs">Editing</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(null)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="space-y-4">
                    {renderItem(item, index)}
                  </div>
                  {!collapsible && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="text-destructive transition-all hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

