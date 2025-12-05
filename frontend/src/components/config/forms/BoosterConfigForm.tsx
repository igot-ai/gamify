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
import {
  boosterConfigSchema,
  type BoosterConfig,
  defaultBoosterConfig,
} from '@/lib/validations/boosterConfig';
import { transformBoosterConfigToExport } from '@/lib/boosterExportTransform';
import { transformBoosterConfigFromImport } from '@/lib/importTransforms';

const isValidConfig = (data: any): data is BoosterConfig => {
  return data && data.undo && data.hint && data.shuffle;
};

interface BoosterConfigFormProps {
  initialData?: BoosterConfig;
  onSubmit: (data: BoosterConfig) => void;
  onChange?: (data: BoosterConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface BoosterConfigFormRef {
  getData: () => BoosterConfig;
  reset: (data: BoosterConfig) => void;
}

export const BoosterConfigForm = forwardRef<BoosterConfigFormRef, BoosterConfigFormProps>(
  function BoosterConfigForm({ initialData, onSubmit, onChange, onCancel, isSaving = false }, ref) {
    const [originalData, setOriginalData] = useState<BoosterConfig | undefined>();
    const initializedRef = useRef(false);

    const effectiveInitialData = isValidConfig(initialData)
      ? {
          ...defaultBoosterConfig,
          ...initialData,
          auto_use_after_ads: initialData.auto_use_after_ads ?? defaultBoosterConfig.auto_use_after_ads,
          time_auto_suggestion: initialData.time_auto_suggestion ?? defaultBoosterConfig.time_auto_suggestion,
          auto_suggestion_enabled: initialData.auto_suggestion_enabled ?? defaultBoosterConfig.auto_suggestion_enabled,
        }
      : defaultBoosterConfig;

    const form = useForm<BoosterConfig>({
      resolver: zodResolver(boosterConfigSchema),
      defaultValues: effectiveInitialData,
    });

    useEffect(() => {
      if (initialData) {
        const data = isValidConfig(initialData)
          ? {
              ...defaultBoosterConfig,
              ...initialData,
              auto_use_after_ads: initialData.auto_use_after_ads ?? defaultBoosterConfig.auto_use_after_ads,
              time_auto_suggestion: initialData.time_auto_suggestion ?? defaultBoosterConfig.time_auto_suggestion,
              auto_suggestion_enabled: initialData.auto_suggestion_enabled ?? defaultBoosterConfig.auto_suggestion_enabled,
            }
          : defaultBoosterConfig;
        setOriginalData(JSON.parse(JSON.stringify(data)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    useEffect(() => {
      const sub = form.watch((data) => onChange?.(data as BoosterConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: BoosterConfig) => {
        const resetData = isValidConfig(data)
          ? {
              ...defaultBoosterConfig,
              ...data,
              auto_use_after_ads: data.auto_use_after_ads ?? defaultBoosterConfig.auto_use_after_ads,
              time_auto_suggestion: data.time_auto_suggestion ?? defaultBoosterConfig.time_auto_suggestion,
              auto_suggestion_enabled: data.auto_suggestion_enabled ?? defaultBoosterConfig.auto_suggestion_enabled,
            }
          : defaultBoosterConfig;
        form.reset(resetData);
        setOriginalData(JSON.parse(JSON.stringify(resetData)));
      },
    }));

    return (
      <Form {...form}>
        <FormWithJsonTabs 
          formData={form.watch()} 
          originalData={originalData} 
          onJsonChange={(data) => form.reset(data)}
          transformToUnity={transformBoosterConfigToExport}
          transformFromUnity={transformBoosterConfigFromImport}
          onSave={() => onSubmit(form.getValues())}
          isSaving={isSaving}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection title="Undo Booster" description="Configure Undo booster settings">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="undo.unlock_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unlock Level</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                      </FormControl>
                      <FormDescription>Level at which Undo unlocks</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="undo.refill_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refill Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Amount to refill per interval</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="undo.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Starting amount for new players</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ConfigFormSection>

            <ConfigFormSection title="Hint Booster" description="Configure Hint booster settings">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="hint.unlock_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unlock Level</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                      </FormControl>
                      <FormDescription>Level at which Hint unlocks</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hint.refill_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refill Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Amount to refill per interval</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hint.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Starting amount for new players</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ConfigFormSection>

            <ConfigFormSection title="Shuffle Booster" description="Configure Shuffle booster settings">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="shuffle.unlock_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unlock Level</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                      </FormControl>
                      <FormDescription>Level at which Shuffle unlocks</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shuffle.refill_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refill Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Amount to refill per interval</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shuffle.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Starting amount for new players</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ConfigFormSection>

            <ConfigFormSection title="General Settings" description="Configure general booster behavior" collapsible={false}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="auto_use_after_ads"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto Use After Ads</FormLabel>
                        <FormDescription>Automatically use booster after watching an ad</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="auto_suggestion_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto Suggestion Enabled</FormLabel>
                        <FormDescription>Enable automatic booster suggestion feature</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time_auto_suggestion"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4">
                      <FormLabel className="text-base">Time Auto Suggestion</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Time in seconds after which to automatically suggest booster usage</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
