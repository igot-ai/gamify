'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle, useEffect } from 'react';
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
import {
  boosterConfigSchema,
  type BoosterConfig,
} from '@/lib/validations/boosterConfig';

const DEFAULT_CONFIG: BoosterConfig = {
  undo: {
    unlock_level: 2,
    refill_amount: 1,
    start: 2,
  },
  hint: {
    unlock_level: 4,
    refill_amount: 1,
    start: 2,
  },
  shuffle: {
    unlock_level: 3,
    refill_amount: 1,
    start: 2,
  },
  auto_use_after_ads: true,
  time_auto_suggestion: 5,
  auto_suggestion_enabled: true,
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
  function BoosterConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
  }, ref) {
    const mergedDefaults = initialData
      ? {
          ...DEFAULT_CONFIG,
          ...initialData,
          auto_use_after_ads:
            initialData.auto_use_after_ads ?? DEFAULT_CONFIG.auto_use_after_ads,
          time_auto_suggestion:
            initialData.time_auto_suggestion ?? DEFAULT_CONFIG.time_auto_suggestion,
          auto_suggestion_enabled:
            initialData.auto_suggestion_enabled ?? DEFAULT_CONFIG.auto_suggestion_enabled,
        }
      : DEFAULT_CONFIG;

    const form = useForm<BoosterConfig>({
      resolver: zodResolver(boosterConfigSchema),
      defaultValues: mergedDefaults,
    });

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: BoosterConfig) => form.reset(data),
    }));

    const watchedValues = form.watch();
    useEffect(() => {
      if (onChange) {
        const currentValues = JSON.stringify(watchedValues);
        const initialValues = JSON.stringify(initialData);
        if (currentValues !== initialValues) {
          onChange(watchedValues);
        }
      }
    }, [watchedValues, onChange, initialData]);

    const isValid = form.formState.isValid;
    const handleSubmit = form.handleSubmit(onSubmit);

    return (
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ConfigFormSection
            title="Undo Booster"
            description="Configure Undo booster settings"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="undo.unlock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unlock Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Level at which Undo unlocks
                    </FormDescription>
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
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount to refill per interval
                    </FormDescription>
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
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Starting amount for new players
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ConfigFormSection>

          <ConfigFormSection
            title="Hint Booster"
            description="Configure Hint booster settings"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="hint.unlock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unlock Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Level at which Hint unlocks
                    </FormDescription>
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
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount to refill per interval
                    </FormDescription>
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
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Starting amount for new players
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ConfigFormSection>

          <ConfigFormSection
            title="Shuffle Booster"
            description="Configure Shuffle booster settings"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="shuffle.unlock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unlock Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Level at which Shuffle unlocks
                    </FormDescription>
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
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount to refill per interval
                    </FormDescription>
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
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Starting amount for new players
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ConfigFormSection>

          <ConfigFormSection
            title="General Settings"
            description="Configure general booster behavior"
            collapsible={false}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="auto_use_after_ads"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto Use After Ads</FormLabel>
                      <FormDescription>
                        Automatically use booster after watching an ad
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                      <FormDescription>
                        Enable automatic booster suggestion feature
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Time in seconds after which to automatically suggest booster usage
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
  }
);
