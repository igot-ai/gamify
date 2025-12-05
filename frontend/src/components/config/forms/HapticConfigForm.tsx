'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { FormWithJsonTabs } from '../shared/FormWithJsonTabs';
import { hapticConfigSchema, type HapticConfig, defaultHapticConfig } from '@/lib/validations/hapticConfig';
import { transformHapticConfigToExport } from '@/lib/hapticExportTransform';
import { transformHapticConfigFromImport } from '@/lib/importTransforms';

const isValidConfig = (data: any): data is HapticConfig => {
  return data && data.soft && data.light && data.medium;
};

interface HapticConfigFormProps {
  initialData?: HapticConfig;
  onSubmit: (data: HapticConfig) => void;
  onChange?: (data: HapticConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface HapticConfigFormRef {
  getData: () => HapticConfig;
  reset: (data: HapticConfig) => void;
}

const HAPTIC_TYPES = ['soft', 'light', 'medium', 'heavy', 'button', 'success', 'error'] as const;

const CollapsibleSection = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-border bg-muted/10">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 p-4 hover:bg-muted/20 transition-colors"
    >
      {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      <span className="text-sm font-semibold text-foreground capitalize">{title}</span>
    </button>
    {isOpen && <div className="px-4 pb-4">{children}</div>}
  </div>
);

export const HapticConfigForm = forwardRef<HapticConfigFormRef, HapticConfigFormProps>(
  function HapticConfigForm({ initialData, onSubmit, onChange, onCancel, isSaving = false }, ref) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ soft: true });
    const [originalData, setOriginalData] = useState<HapticConfig | undefined>();
    const initializedRef = useRef(false);

    const effectiveInitialData = isValidConfig(initialData) ? initialData : defaultHapticConfig;

    const form = useForm<HapticConfig>({
      resolver: zodResolver(hapticConfigSchema),
      defaultValues: effectiveInitialData,
    });

    useEffect(() => {
      if (initialData) {
        const data = isValidConfig(initialData) ? initialData : defaultHapticConfig;
        setOriginalData(JSON.parse(JSON.stringify(data)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    useEffect(() => {
      const sub = form.watch((data) => onChange?.(data as HapticConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: HapticConfig) => {
        const resetData = isValidConfig(data) ? data : defaultHapticConfig;
        form.reset(resetData);
        setOriginalData(JSON.parse(JSON.stringify(resetData)));
      },
    }));

    const renderHapticTypeFields = (hapticType: typeof HAPTIC_TYPES[number]) => (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-green-500" />
            Android
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name={`${hapticType}.android.duration`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Duration (ms)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${hapticType}.android.amplitude`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Amplitude (0-255)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background/50 p-3">
          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-blue-500" />
            iOS
          </h5>
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name={`${hapticType}.ios.intensity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Intensity (0-1)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${hapticType}.ios.sharpness`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Sharpness (0-1)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${hapticType}.ios.duration`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Duration (s)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );

    return (
      <Form {...form}>
        <FormWithJsonTabs 
          formData={form.watch()} 
          originalData={originalData} 
          onJsonChange={(data) => form.reset(data)}
          transformToUnity={transformHapticConfigToExport}
          transformFromUnity={transformHapticConfigFromImport}
          onSave={() => onSubmit(form.getValues())}
          isSaving={isSaving}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection title="Haptic Feedback" description="Configure haptic feedback settings for different feedback types on Android and iOS">
              <div className="space-y-2">
                {HAPTIC_TYPES.map((hapticType) => (
                  <CollapsibleSection
                    key={hapticType}
                    title={hapticType}
                    isOpen={openSections[hapticType] ?? false}
                    onToggle={() => setOpenSections((prev) => ({ ...prev, [hapticType]: !prev[hapticType] }))}
                  >
                    {renderHapticTypeFields(hapticType)}
                  </CollapsibleSection>
                ))}
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
