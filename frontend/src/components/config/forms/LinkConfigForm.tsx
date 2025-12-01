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
import { ConfigFormSection } from '../shared/ConfigFormSection';
import {
  linkConfigSchema,
  type LinkConfig,
} from '@/lib/validations/linkConfig';

const DEFAULT_CONFIG: LinkConfig = {
  privacy_link: '',
  terms_link: '',
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
}

export const LinkConfigForm = forwardRef<LinkConfigFormRef, LinkConfigFormProps>(
  function LinkConfigForm({
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

    const form = useForm<LinkConfig>({
      resolver: zodResolver(linkConfigSchema),
      defaultValues: mergedDefaults,
    });

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
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
            title="Legal Links"
            description="Configure privacy policy and terms of service URLs"
            collapsible={false}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="privacy_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Link</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/privacy"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your privacy policy page
                    </FormDescription>
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
                      <Input
                        type="url"
                        placeholder="https://example.com/terms"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your terms of service page
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

