'use client';

import { forwardRef, useImperativeHandle } from 'react';
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
import {
  analyticsConfigSchema,
  type AnalyticsConfig,
} from '@/lib/validations/analyticsConfig';

interface AnalyticsConfigFormProps {
  initialData?: AnalyticsConfig;
  onSubmit: (data: AnalyticsConfig) => void;
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
  onCancel,
  isSaving = false,
  }, ref) {
  const form = useForm<AnalyticsConfig>({
    resolver: zodResolver(analyticsConfigSchema),
      defaultValues: initialData ?? {
      dev_key: '',
      app_id: '',
    },
  });

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: AnalyticsConfig) => form.reset(data),
    }));

  const isValid = form.formState.isValid;
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={!isValid || isSaving}
            className="shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
});

