'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle, useEffect, useState, useRef } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { FormWithJsonTabs } from '../shared/FormWithJsonTabs';
import { ratingConfigSchema, type RatingConfig } from '@/lib/validations/ratingConfig';

const DEFAULT_CONFIG: RatingConfig = {
  enabled: true,
  min_star_required: 4,
  interval_hours: 48.0,
  min_levels: 9,
  max_show_count: 3,
};

interface RatingConfigFormProps {
  initialData?: RatingConfig;
  onSubmit: (data: RatingConfig) => void;
  onChange?: (data: RatingConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface RatingConfigFormRef {
  getData: () => RatingConfig;
  reset: (data: RatingConfig) => void;
}

export const RatingConfigForm = forwardRef<RatingConfigFormRef, RatingConfigFormProps>(
  function RatingConfigForm({ initialData, onSubmit, onChange, onCancel, isSaving = false }, ref) {
    const [originalData, setOriginalData] = useState<RatingConfig | undefined>();
    const initializedRef = useRef(false);

    const form = useForm<RatingConfig>({
      resolver: zodResolver(ratingConfigSchema),
      defaultValues: initialData ? { ...DEFAULT_CONFIG, ...initialData } : DEFAULT_CONFIG,
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
      const sub = form.watch((data) => onChange?.(data as RatingConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: RatingConfig) => {
        form.reset(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
      },
    }));

    return (
      <Form {...form}>
        <FormWithJsonTabs formData={form.watch()} originalData={originalData} onJsonChange={(data) => form.reset(data)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection title="Rating Settings" description="Configure in-app rating prompt behavior" collapsible={false}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enabled</FormLabel>
                        <FormDescription>Determines whether the rating feature is enabled</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="min_star_required"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Star Required</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={5} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                        </FormControl>
                        <FormDescription>Minimum star rating required to prompt the user to leave a store review.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interval_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interval Hours</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormDescription>Minimum time interval (in hours) between showing the rating popup again</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="min_levels"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Levels</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                        </FormControl>
                        <FormDescription>When the user reaches this level, they become eligible to see the rating popup</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_show_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Show Count</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                        </FormControl>
                        <FormDescription>Maximum number of times the rating popup can be shown to a user</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </ConfigFormSection>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
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
