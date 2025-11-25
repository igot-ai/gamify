'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
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
import { ConfigActions } from '../shared/ConfigActions';
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

export function AnalyticsConfigForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving = false,
}: AnalyticsConfigFormProps) {
  const form = useForm<AnalyticsConfig>({
    resolver: zodResolver(analyticsConfigSchema),
    defaultValues: initialData || {
      dev_key: '',
      app_id: '',
    },
  });

  const hasChanges = form.formState.isDirty;
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

        <ConfigActions
          onSave={handleSubmit}
          onCancel={onCancel}
          hasChanges={hasChanges}
          isValid={isValid}
          isSaving={isSaving}
          showExport={false}
          showImport={false}
        />
      </form>
    </Form>
  );
}

