'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { JsonEditor } from '../economy/shared/JsonEditor';
import {
  tutorialConfigSchema,
  defaultTutorialConfig,
  type TutorialConfig,
} from '@/lib/validations/tutorialConfig';

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
    const initializedRef = useRef(false);

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

    useEffect(() => {
      if (initialData) {
        setOriginalData(JSON.parse(JSON.stringify(initialData)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    useEffect(() => {
      const sub = form.watch((data) => onChange?.(data as TutorialConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: TutorialConfig) => {
        form.reset(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
      },
    }));

    const handleJsonChange = (data: TutorialConfig) => {
      if (data && typeof data === 'object') {
        form.reset(data);
      }
    };

    return (
      <Form {...form}>
        <div className="space-y-6">
          <JsonEditor
            value={form.watch()}
            originalValue={originalData}
            onChange={handleJsonChange}
            readOnly={false}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={() => onSubmit(form.getValues())}
              disabled={!form.formState.isValid || isSaving}
              className="shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Form>
    );
  }
);
