'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { FileText, Code } from 'lucide-react';
import { JsonEditor } from '../economy/shared/JsonEditor';

interface FormWithJsonTabsProps<T> {
  children: React.ReactNode;
  formData: T;
  originalData?: T;
  onJsonChange: (data: T) => void;
  readOnly?: boolean;
}

export function FormWithJsonTabs<T>({
  children,
  formData,
  originalData,
  onJsonChange,
  readOnly = false,
}: FormWithJsonTabsProps<T>) {
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');

  const hasChanges = useMemo(
    () => originalData && JSON.stringify(formData) !== JSON.stringify(originalData),
    [formData, originalData]
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

      <TabsContent value="json" className="mt-0">
        <JsonEditor
          value={formData}
          originalValue={originalData}
          onChange={readOnly ? undefined : onJsonChange}
          readOnly={readOnly}
        />
      </TabsContent>
    </Tabs>
  );
}
