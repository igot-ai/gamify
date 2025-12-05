'use client';

import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { FileText, Code, Save, Loader2 } from 'lucide-react';
import { JsonEditor } from '../economy/shared/JsonEditor';
import { Button } from '@/components/ui/Button';

interface FormWithJsonTabsProps<T, U = T> {
  children: React.ReactNode;
  formData: T;
  originalData?: T;
  onJsonChange: (data: T) => void;
  readOnly?: boolean;
  /** Transform form data (camelCase) to Unity format (PascalCase) for JSON display */
  transformToUnity?: (data: T) => U;
  /** Transform Unity format (PascalCase) back to form data (camelCase) */
  transformFromUnity?: (data: U) => T;
  /** Callback to save changes */
  onSave?: () => void;
  /** Whether currently saving */
  isSaving?: boolean;
}

export function FormWithJsonTabs<T, U = T>({
  children,
  formData,
  originalData,
  onJsonChange,
  readOnly = false,
  transformToUnity,
  transformFromUnity,
  onSave,
  isSaving = false,
}: FormWithJsonTabsProps<T, U>) {
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');

  // Transform data for JSON display (to Unity/PascalCase format)
  const jsonDisplayData = useMemo(
    () => (transformToUnity ? transformToUnity(formData) : formData),
    [formData, transformToUnity]
  );

  const jsonOriginalData = useMemo(
    () => (transformToUnity && originalData ? transformToUnity(originalData) : originalData),
    [originalData, transformToUnity]
  );

  const hasChanges = useMemo(
    () => originalData && JSON.stringify(formData) !== JSON.stringify(originalData),
    [formData, originalData]
  );

  // Handle JSON changes - transform back to form format (camelCase) if needed
  const handleJsonChange = useCallback(
    (data: any) => {
      const formFormatData = transformFromUnity ? transformFromUnity(data) : data;
      onJsonChange(formFormatData);
    },
    [onJsonChange, transformFromUnity]
  );

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'json')}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="form" className="text-sm">
          <FileText className="h-4 w-4 mr-2" />
          Form
        </TabsTrigger>
        <TabsTrigger value="json" className="text-sm relative">
          <Code className="h-4 w-4 mr-2" />
          JSON
          {hasChanges && <span className="ml-1.5 h-2 w-2 rounded-full bg-primary" />}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="mt-0">
        {children}
      </TabsContent>

      <TabsContent value="json" className="mt-0 space-y-4">
        <JsonEditor
          value={jsonDisplayData}
          originalValue={jsonOriginalData}
          onChange={readOnly ? undefined : handleJsonChange}
          readOnly={readOnly}
        />
        
        {/* Save Button for JSON tab */}
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
      </TabsContent>
    </Tabs>
  );
}
