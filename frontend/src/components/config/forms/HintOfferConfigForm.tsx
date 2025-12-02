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
  hintOfferConfigSchema,
  defaultHintOfferConfig,
  type HintOfferConfig,
} from '@/lib/validations/hintOfferConfig';

interface HintOfferConfigFormProps {
  initialData?: HintOfferConfig;
  onSubmit: (data: HintOfferConfig) => void;
  onChange?: (data: HintOfferConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface HintOfferConfigFormRef {
  getData: () => HintOfferConfig;
  reset: (data: HintOfferConfig) => void;
}

export const HintOfferConfigForm = forwardRef<HintOfferConfigFormRef, HintOfferConfigFormProps>(
  function HintOfferConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
  }, ref) {
    const mergedDefaults = initialData
      ? {
          ...defaultHintOfferConfig,
          ...initialData,
        }
      : defaultHintOfferConfig;

    const form = useForm<HintOfferConfig>({
      resolver: zodResolver(hintOfferConfigSchema),
      defaultValues: mergedDefaults,
    });

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: HintOfferConfig) => form.reset(data),
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
            title="Hint Offer Settings"
            description="Configure when and how hint offers appear to players"
            collapsible={false}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enabled</FormLabel>
                      <FormDescription>
                        Enable or disable hint offers
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        How long the hint offer stays on screen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delay_before_countdown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delay Before Countdown (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Delay before the countdown timer starts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Player must reach this level to see hint offers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idle_time_trigger"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idle Time Trigger (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        How long player must be idle before showing offer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_appearances_per_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Appearances Per Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum times the offer can appear in a single level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

