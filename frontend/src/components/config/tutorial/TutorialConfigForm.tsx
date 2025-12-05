'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle, useEffect, useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Save, Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/Form';
import { JsonEditor } from '../economy/shared/JsonEditor';
import {
  tutorialConfigSchema,
  defaultTutorialConfig,
  type TutorialConfig,
} from '@/lib/validations/tutorialConfig';
import { transformTutorialConfigToExport } from '@/lib/tutorialExportTransform';
import { transformTutorialConfigFromImport } from '@/lib/importTransforms';

interface TutorialConfigFormProps {
  initialData?: TutorialConfig;
  onSubmit: (data: TutorialConfig) => void;
  onChange?: (data: TutorialConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export interface TutorialConfigFormRef {
  getData: () => TutorialConfig;
  reset: (data: TutorialConfig) => void;
}

export const TutorialConfigForm = forwardRef<TutorialConfigFormRef, TutorialConfigFormProps>(
  function TutorialConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
  }, ref) {
    const [originalData, setOriginalData] = useState<TutorialConfig | undefined>();
    const isResettingRef = useRef(false);

    const mergedDefaults = initialData
      ? {
          ...defaultTutorialConfig,
          ...initialData,
          data: {
            ...defaultTutorialConfig.data,
            ...initialData?.data,
          },
        }
      : defaultTutorialConfig;

    const form = useForm<TutorialConfig>({
      resolver: zodResolver(tutorialConfigSchema),
      defaultValues: mergedDefaults,
    });

    // Update form and originalData when initialData changes (version switch)
    useEffect(() => {
      if (initialData) {
        isResettingRef.current = true;
        const data = {
          ...defaultTutorialConfig,
          ...initialData,
          data: {
            ...defaultTutorialConfig.data,
            ...initialData?.data,
          },
        };
        form.reset(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
        // Allow onChange to work again after a short delay
        setTimeout(() => {
          isResettingRef.current = false;
        }, 100);
      }
    }, [initialData, form]);

    // Watch for changes but skip during reset
    useEffect(() => {
      const sub = form.watch((data) => {
        if (!isResettingRef.current && onChange) {
          onChange(data as TutorialConfig);
        }
      });
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: TutorialConfig) => {
        isResettingRef.current = true;
        form.reset(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
        setTimeout(() => {
          isResettingRef.current = false;
        }, 100);
      },
    }));

    // Transform data for JSON display (to Unity/PascalCase format)
    const jsonDisplayData = useMemo(
      () => transformTutorialConfigToExport(form.watch()),
      [form.watch()]
    );

    const jsonOriginalData = useMemo(
      () => originalData ? transformTutorialConfigToExport(originalData) : undefined,
      [originalData]
    );

    const handleJsonChange = (data: any) => {
      if (data && typeof data === 'object') {
        const internalData = transformTutorialConfigFromImport(data);
        form.reset(internalData);
      }
    };

    return (
      <Form {...form}>
        <div className="space-y-4">
          <JsonEditor
            value={jsonDisplayData}
            originalValue={jsonOriginalData}
            onChange={handleJsonChange}
            readOnly={false}
          />

          {/* Save Button */}
          <div className="flex items-center justify-end pt-4 border-t border-border/30">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="mr-3"
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={() => onSubmit(form.getValues())}
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
        </div>
      </Form>
    );
  }
);
