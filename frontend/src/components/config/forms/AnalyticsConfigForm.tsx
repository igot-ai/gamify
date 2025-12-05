'use client';

import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { FormWithJsonTabs } from '../shared/FormWithJsonTabs';
import {
  analyticsConfigSchema,
  type AnalyticsConfig,
  defaultAnalyticsConfig,
} from '@/lib/validations/analyticsConfig';
import { transformAnalyticsConfigToExport } from '@/lib/analyticsExportTransform';
import { transformAnalyticsConfigFromImport } from '@/lib/importTransforms';

const isValidConfig = (data: any): data is AnalyticsConfig => {
  return data && typeof data.dev_key === 'string';
};

interface AnalyticsConfigFormProps {
  initialData?: AnalyticsConfig;
  onSubmit: (data: AnalyticsConfig) => void;
  onChange?: (data: AnalyticsConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface AnalyticsConfigFormRef {
  getData: () => AnalyticsConfig;
  reset: (data: AnalyticsConfig) => void;
}

export const AnalyticsConfigForm = forwardRef<AnalyticsConfigFormRef, AnalyticsConfigFormProps>(
  function AnalyticsConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
  }, ref) {
    const [originalData, setOriginalData] = useState<AnalyticsConfig | undefined>();
    const initializedRef = useRef(false);

    const effectiveInitialData = isValidConfig(initialData)
      ? { ...defaultAnalyticsConfig, ...initialData }
      : defaultAnalyticsConfig;

    const form = useForm<AnalyticsConfig>({
      resolver: zodResolver(analyticsConfigSchema),
      defaultValues: effectiveInitialData,
    });

    useEffect(() => {
      if (initialData) {
        const data = isValidConfig(initialData)
          ? { ...defaultAnalyticsConfig, ...initialData }
          : defaultAnalyticsConfig;
        setOriginalData(JSON.parse(JSON.stringify(data)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: AnalyticsConfig) => {
        const resetData = isValidConfig(data)
          ? { ...defaultAnalyticsConfig, ...data }
          : defaultAnalyticsConfig;
        form.reset(resetData);
        setOriginalData(JSON.parse(JSON.stringify(resetData)));
      },
    }));

    useEffect(() => {
      const sub = form.watch((data) => onChange?.(data as AnalyticsConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    return (
      <Form {...form}>
        <FormWithJsonTabs
          formData={form.watch()}
          originalData={originalData}
          onJsonChange={(data) => form.reset(data)}
          transformToUnity={transformAnalyticsConfigToExport}
          transformFromUnity={transformAnalyticsConfigFromImport}
          onSave={() => onSubmit(form.getValues())}
          isSaving={isSaving}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection
              title="Appsflyer Configuration"
              description="Configure AppsFlyer analytics integration"
              defaultOpen={true}
              collapsible={false}
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="dev_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dev Key</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter AppsFlyer Dev Key" />
                      </FormControl>
                      <FormDescription>
                        Your AppsFlyer developer key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="app_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>App ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="com.example.app" />
                      </FormControl>
                      <FormDescription>
                        Your application identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ConfigFormSection>

            {/* Bottom Actions */}
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
                type="submit"
                disabled={!form.formState.isValid || isSaving}
                className="shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </FormWithJsonTabs>
      </Form>
    );
  }
);

