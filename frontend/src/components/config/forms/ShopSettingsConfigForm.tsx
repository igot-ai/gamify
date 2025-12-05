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
  shopSettingsConfigSchema,
  type ShopSettingsConfig,
  defaultShopSettingsConfig,
} from '@/lib/validations/shopSettingsConfig';
import { transformShopSettingsConfigToExport } from '@/lib/shopSettingsExportTransform';
import { transformShopSettingsConfigFromImport } from '@/lib/importTransforms';

const isValidConfig = (data: any): data is ShopSettingsConfig => {
  return data && typeof data.enabled === 'boolean';
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
  function ShopSettingsConfigForm({ initialData, onSubmit, onChange, onCancel, isSaving = false }, ref) {
    const [originalData, setOriginalData] = useState<ShopSettingsConfig | undefined>();
    const initializedRef = useRef(false);

    const effectiveInitialData = isValidConfig(initialData) 
      ? { ...defaultShopSettingsConfig, ...initialData } 
      : defaultShopSettingsConfig;

    const form = useForm<ShopSettingsConfig>({
      resolver: zodResolver(shopSettingsConfigSchema),
      defaultValues: effectiveInitialData,
    });

    useEffect(() => {
      if (initialData) {
        const data = isValidConfig(initialData) 
          ? { ...defaultShopSettingsConfig, ...initialData } 
          : defaultShopSettingsConfig;
        setOriginalData(JSON.parse(JSON.stringify(data)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    useEffect(() => {
      const sub = form.watch((data) => onChange?.(data as ShopSettingsConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: ShopSettingsConfig) => {
        const resetData = isValidConfig(data) 
          ? { ...defaultShopSettingsConfig, ...data } 
          : defaultShopSettingsConfig;
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
          transformToUnity={transformShopSettingsConfigToExport}
          transformFromUnity={transformShopSettingsConfigFromImport}
          onSave={() => onSubmit(form.getValues())}
          isSaving={isSaving}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection title="Shop Settings" description="Configure shop behavior and restore settings" collapsible={false}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enabled</FormLabel>
                        <FormDescription>Enable or disable the shop feature</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                        <Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                      </FormControl>
                      <FormDescription>Minimum level required to restore purchases</FormDescription>
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
