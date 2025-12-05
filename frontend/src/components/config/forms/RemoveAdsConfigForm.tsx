'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
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
import { FormWithJsonTabs } from '../shared/FormWithJsonTabs';
import {
  removeAdsConfigSchema,
  type RemoveAdsConfig,
  defaultRemoveAdsConfig,
} from '@/lib/validations/removeAdsConfig';
import { transformRemoveAdsConfigToExport } from '@/lib/removeAdsExportTransform';
import { transformRemoveAdsConfigFromImport } from '@/lib/importTransforms';

const isValidConfig = (data: any): data is RemoveAdsConfig => {
  return data && typeof data.enabled === 'boolean';
};

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
    const [originalData, setOriginalData] = useState<RemoveAdsConfig | undefined>();
    const initializedRef = useRef(false);

    const effectiveInitialData = isValidConfig(initialData)
      ? { ...defaultRemoveAdsConfig, ...initialData }
      : defaultRemoveAdsConfig;

    const form = useForm<RemoveAdsConfig>({
      resolver: zodResolver(removeAdsConfigSchema) as any,
      defaultValues: effectiveInitialData,
    });

    useEffect(() => {
      if (initialData) {
        const data = isValidConfig(initialData)
          ? { ...defaultRemoveAdsConfig, ...initialData }
          : defaultRemoveAdsConfig;
        setOriginalData(JSON.parse(JSON.stringify(data)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: RemoveAdsConfig) => {
        const resetData = isValidConfig(data)
          ? { ...defaultRemoveAdsConfig, ...data }
          : defaultRemoveAdsConfig;
        form.reset(resetData);
        setOriginalData(JSON.parse(JSON.stringify(resetData)));
      },
    }));

    useEffect(() => {
      const subscription = form.watch((data) => onChange?.(data as RemoveAdsConfig));
      return () => subscription.unsubscribe();
    }, [form, onChange]);

    return (
      <Form {...form}>
        <FormWithJsonTabs
          formData={form.watch()}
          originalData={originalData}
          onJsonChange={(data) => form.reset(data)}
          transformToUnity={transformRemoveAdsConfigToExport}
          transformFromUnity={transformRemoveAdsConfigFromImport}
          onSave={() => onSubmit(form.getValues())}
          isSaving={isSaving}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
