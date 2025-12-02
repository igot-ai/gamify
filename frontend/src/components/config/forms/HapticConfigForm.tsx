'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
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
import {
  hapticConfigSchema,
  type HapticConfig,
} from '@/lib/validations/hapticConfig';

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

// Haptic type names for the form
const HAPTIC_TYPES = ['soft', 'light', 'medium', 'heavy', 'button', 'success', 'error'] as const;

// Collapsible section component
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
  <div className="rounded-lg border border-border/30 bg-muted/10">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 p-4 hover:bg-muted/20 transition-colors"
    >
      {isOpen ? (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="text-sm font-semibold text-foreground capitalize">{title}</span>
    </button>
    {isOpen && <div className="px-4 pb-4">{children}</div>}
  </div>
);

export const HapticConfigForm = forwardRef<HapticConfigFormRef, HapticConfigFormProps>(
  function HapticConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
  }, ref) {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
      soft: true, // Default open first section
    });

    const form = useForm<HapticConfig>({
      resolver: zodResolver(hapticConfigSchema),
      defaultValues: initialData,
    });

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: HapticConfig) => form.reset(data),
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

    const toggleSection = (section: string) => {
      setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const isValid = form.formState.isValid;
    const handleSubmit = form.handleSubmit(onSubmit);

    const renderHapticTypeFields = (hapticType: typeof HAPTIC_TYPES[number]) => (
      <div className="space-y-4">
        {/* Android Settings */}
        <div className="rounded-lg border border-border/20 bg-background/50 p-3">
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
                  <FormLabel className="text-xs text-muted-foreground">Duration (ms)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                      className="h-8 bg-muted/30 text-sm"
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
                  <FormLabel className="text-xs text-muted-foreground">Amplitude (0-255)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                      className="h-8 bg-muted/30 text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* iOS Settings */}
        <div className="rounded-lg border border-border/20 bg-background/50 p-3">
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
                  <FormLabel className="text-xs text-muted-foreground">Intensity (0-1)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="h-8 bg-muted/30 text-sm"
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
                  <FormLabel className="text-xs text-muted-foreground">Sharpness (0-1)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="h-8 bg-muted/30 text-sm"
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
                  <FormLabel className="text-xs text-muted-foreground">Duration (s)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      className="h-8 bg-muted/30 text-sm"
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <ConfigFormSection
            title="Haptic Feedback"
            description="Configure haptic feedback settings for different feedback types on Android and iOS"
          >
            <div className="space-y-2">
              {HAPTIC_TYPES.map((hapticType) => (
                <CollapsibleSection
                  key={hapticType}
                  title={hapticType}
                  isOpen={openSections[hapticType] ?? false}
                  onToggle={() => toggleSection(hapticType)}
                >
                  {renderHapticTypeFields(hapticType)}
                </CollapsibleSection>
              ))}
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
