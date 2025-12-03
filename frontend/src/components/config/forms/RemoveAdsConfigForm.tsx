'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Switch } from '@/components/ui/switch';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import {
  removeAdsConfigSchema,
  type RemoveAdsConfig,
} from '@/lib/validations/removeAdsConfig';

interface RemoveAdsConfigFormProps {
  initialData?: RemoveAdsConfig;
  onSubmit: (data: RemoveAdsConfig) => void;
  onChange?: (data: RemoveAdsConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface RemoveAdsConfigFormRef {
  getData: () => RemoveAdsConfig;
  reset: (data: RemoveAdsConfig) => void;
}

export const RemoveAdsConfigForm = forwardRef<RemoveAdsConfigFormRef, RemoveAdsConfigFormProps>(
  function RemoveAdsConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
  }, ref) {
    const form = useForm<RemoveAdsConfig>({
      resolver: zodResolver(removeAdsConfigSchema) as any,
      defaultValues: initialData,
    });

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: RemoveAdsConfig) => form.reset(data),
    }));

    // Watch for changes and notify parent
    React.useEffect(() => {
      const subscription = form.watch((data) => {
        if (onChange) {
          onChange(data as RemoveAdsConfig);
        }
      });
      return () => subscription.unsubscribe();
    }, [form, onChange]);

    const isValid = form.formState.isValid;
    const handleSubmit = form.handleSubmit(onSubmit);

    return (
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ConfigFormSection
            title="Remove Ads Offer"
            description="Configure the remove ads offer settings and triggers"
          >
            <div className="space-y-4">
              {/* Enabled Toggle */}
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">Enabled</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Trigger Settings */}
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Trigger Settings
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="minLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Min Level</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adWatchedTrigger"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Ad Watched Trigger</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="daysPlayedTrigger"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Days Played Trigger</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Display Settings */}
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Display Settings
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="durationHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Duration Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxLifetimeShows"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Max Lifetime Shows</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxSessionShows"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Max Session Shows</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Cooldown Settings */}
              <div className="rounded-lg border border-border bg-muted/10 p-4">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Cooldown Settings
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cooldownPopupHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Cooldown Popup Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cooldownOfferHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Cooldown Offer Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </ConfigFormSection>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
