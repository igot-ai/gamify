'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Plus, Trash2, Save, Loader2, FileText, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JsonEditor } from './JsonEditor';

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
  /** JSON data for the JSON editor tab */
  jsonData?: any;
  /** Original JSON data for diff comparison */
  originalJsonData?: any;
  /** Callback when JSON is changed in the editor */
  onJsonChange?: (data: any) => void;
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
  jsonData,
  originalJsonData,
  onJsonChange,
}: SectionWrapperProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');

  const hasJsonSupport = jsonData !== undefined && onJsonChange !== undefined;
  const hasChanges = hasJsonSupport && JSON.stringify(jsonData) !== JSON.stringify(originalJsonData);

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

      {/* Tabs for Form/JSON */}
      {hasJsonSupport ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'json')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Form
            </TabsTrigger>
            <TabsTrigger value="json" className="text-sm relative">
              <Code className="h-4 w-4 mr-2" />
              JSON
              {hasChanges && (
                <span className="ml-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-4">
            {/* Actions - only show in Form tab */}
            {!readOnly && (onAdd || (showClearAll && itemCount > 0 && onClearAll)) && (
              <div className="flex items-center justify-end gap-2 mb-4">
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
            {/* Form Content */}
            <div className="animate-fade-in">
              {children}
            </div>
          </TabsContent>

          <TabsContent value="json" className="mt-4">
            {/* JSON Editor */}
            <JsonEditor
              value={jsonData}
              originalValue={originalJsonData}
              onChange={onJsonChange}
              readOnly={readOnly}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {/* Actions - when no JSON support */}
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
        </>
      )}

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
