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
  shopSettingsConfigSchema,
  type ShopSettingsConfig,
} from '@/lib/validations/shopSettingsConfig';

const DEFAULT_CONFIG: ShopSettingsConfig = {
  enabled: true,
  restore_min_level: 1,
};

interface ShopSettingsConfigFormProps {
  initialData?: ShopSettingsConfig;
  onSubmit: (data: ShopSettingsConfig) => void;
  onChange?: (data: ShopSettingsConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface ShopSettingsConfigFormRef {
  getData: () => ShopSettingsConfig;
  reset: (data: ShopSettingsConfig) => void;
}

export const ShopSettingsConfigForm = forwardRef<ShopSettingsConfigFormRef, ShopSettingsConfigFormProps>(
  function ShopSettingsConfigForm({
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
        }
      : DEFAULT_CONFIG;

    const form = useForm<ShopSettingsConfig>({
      resolver: zodResolver(shopSettingsConfigSchema),
      defaultValues: mergedDefaults,
    });

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: ShopSettingsConfig) => form.reset(data),
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
            title="Shop Settings"
            description="Configure shop behavior and restore settings"
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
                        Enable or disable the shop feature
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
                name="restore_min_level"
                render={({ field }) => (
                  <FormItem className="rounded-lg border p-4">
                    <FormLabel className="text-base">Restore Min Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum level required to restore purchases
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

