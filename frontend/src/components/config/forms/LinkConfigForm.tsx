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
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { FormWithJsonTabs } from '../shared/FormWithJsonTabs';
import { linkConfigSchema, type LinkConfig, defaultLinkConfig } from '@/lib/validations/linkConfig';
import { transformLinkConfigToExport } from '@/lib/linkExportTransform';
import { transformLinkConfigFromImport } from '@/lib/importTransforms';

const isValidConfig = (data: any): data is LinkConfig => {
  return data && (typeof data.privacy_link === 'string' || typeof data.terms_link === 'string');
};

interface LinkConfigFormProps {
  initialData?: LinkConfig;
  onSubmit: (data: LinkConfig) => void;
  onChange?: (data: LinkConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface LinkConfigFormRef {
  getData: () => LinkConfig;
  reset: (data: LinkConfig) => void;
}

export const LinkConfigForm = forwardRef<LinkConfigFormRef, LinkConfigFormProps>(
  function LinkConfigForm({ initialData, onSubmit, onChange, onCancel, isSaving = false }, ref) {
    const [originalData, setOriginalData] = useState<LinkConfig | undefined>();
    const initializedRef = useRef(false);

    const effectiveInitialData = isValidConfig(initialData) 
      ? { ...defaultLinkConfig, ...initialData } 
      : defaultLinkConfig;

    const form = useForm<LinkConfig>({
      resolver: zodResolver(linkConfigSchema),
      defaultValues: effectiveInitialData,
    });

    useEffect(() => {
      if (initialData) {
        const data = isValidConfig(initialData) 
          ? { ...defaultLinkConfig, ...initialData } 
          : defaultLinkConfig;
        setOriginalData(JSON.parse(JSON.stringify(data)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    useEffect(() => {
      const sub = form.watch((data) => onChange?.(data as LinkConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: LinkConfig) => {
        const resetData = isValidConfig(data) 
          ? { ...defaultLinkConfig, ...data } 
          : defaultLinkConfig;
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
          transformToUnity={transformLinkConfigToExport}
          transformFromUnity={transformLinkConfigFromImport}
          onSave={() => onSubmit(form.getValues())}
          isSaving={isSaving}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection title="Legal Links" description="Configure privacy policy and terms of service URLs" collapsible={false}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="privacy_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Privacy Link</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/privacy" {...field} />
                      </FormControl>
                      <FormDescription>URL to your privacy policy page</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="terms_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms Link</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/terms" {...field} />
                      </FormControl>
                      <FormDescription>URL to your terms of service page</FormDescription>
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
