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
import { chapterRewardConfigSchema, type ChapterRewardConfig } from '@/lib/validations/chapterRewardConfig';

const DEFAULT_CONFIG: ChapterRewardConfig = {
  undo: 1,
  hint: 1,
  shuffle: 1,
};

interface ChapterRewardConfigFormProps {
  initialData?: ChapterRewardConfig;
  onSubmit: (data: ChapterRewardConfig) => void;
  onChange?: (data: ChapterRewardConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface ChapterRewardConfigFormRef {
  getData: () => ChapterRewardConfig;
  reset: (data: ChapterRewardConfig) => void;
}

export const ChapterRewardConfigForm = forwardRef<ChapterRewardConfigFormRef, ChapterRewardConfigFormProps>(
  function ChapterRewardConfigForm({ initialData, onSubmit, onChange, onCancel, isSaving = false }, ref) {
    const [originalData, setOriginalData] = useState<ChapterRewardConfig | undefined>();
    const initializedRef = useRef(false);

    const form = useForm<ChapterRewardConfig>({
      resolver: zodResolver(chapterRewardConfigSchema),
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
      const sub = form.watch((data) => onChange?.(data as ChapterRewardConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: ChapterRewardConfig) => {
        form.reset(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
      },
    }));

    return (
      <Form {...form}>
        <FormWithJsonTabs formData={form.watch()} originalData={originalData} onJsonChange={(data) => form.reset(data)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection title="Chapter Completion Rewards" description="Configure rewards given when players complete a chapter" collapsible={false}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="undo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Undo</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Number of Undo boosters to reward</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hint</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Number of Hint boosters to reward</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shuffle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shuffle</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Number of Shuffle boosters to reward</FormDescription>
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
