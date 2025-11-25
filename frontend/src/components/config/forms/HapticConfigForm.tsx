'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
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
import { ConfigActions } from '../shared/ConfigActions';
import {
  hapticConfigSchema,
  type HapticConfig,
} from '@/lib/validations/hapticConfig';

interface HapticConfigFormProps {
  initialData?: HapticConfig;
  onSubmit: (data: HapticConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

const HapticTypeFields = ({ type, control }: { type: string; control: any }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
      Android Settings
    </h4>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={control}
        name={`${type}.android.duration`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (ms)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>Vibration duration in milliseconds</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${type}.android.amplitude`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amplitude (0-255)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>Vibration intensity (0-255)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 pt-4">
      iOS Settings
    </h4>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <FormField
        control={control}
        name={`${type}.ios.intensity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Intensity (0-1)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>Haptic intensity (0-1)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${type}.ios.sharpness`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sharpness (0-1)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>Haptic sharpness (0-1)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${type}.ios.duration`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration (s)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>Duration in seconds</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
);

export function HapticConfigForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving = false,
}: HapticConfigFormProps) {
  const form = useForm<HapticConfig>({
    resolver: zodResolver(hapticConfigSchema),
    defaultValues: initialData || {
      soft: {
        android: { duration: 10, amplitude: 40 },
        ios: { intensity: 0.6, sharpness: 0, duration: 0.01 },
      },
      light: {
        android: { duration: 10, amplitude: 60 },
        ios: { intensity: 0.5, sharpness: 0.3, duration: 0.02 },
      },
      medium: {
        android: { duration: 15, amplitude: 120 },
        ios: { intensity: 0.7, sharpness: 0.5, duration: 0.03 },
      },
      heavy: {
        android: { duration: 20, amplitude: 200 },
        ios: { intensity: 1.0, sharpness: 0.8, duration: 0.05 },
      },
      button: {
        android: { duration: 5, amplitude: 30 },
        ios: { intensity: 0.3, sharpness: 0.2, duration: 0.01 },
      },
      success: {
        android: { duration: 25, amplitude: 150 },
        ios: { intensity: 0.8, sharpness: 0.7, duration: 0.04 },
      },
      error: {
        android: { duration: 30, amplitude: 200 },
        ios: { intensity: 1.0, sharpness: 1.0, duration: 0.05 },
      },
    },
  });

  const hasChanges = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ConfigFormSection
          title="Soft Haptic"
          description="Very light haptic feedback"
        >
          <HapticTypeFields type="soft" control={form.control} />
        </ConfigFormSection>

        <ConfigFormSection
          title="Light Haptic"
          description="Light haptic feedback"
        >
          <HapticTypeFields type="light" control={form.control} />
        </ConfigFormSection>

        <ConfigFormSection
          title="Medium Haptic"
          description="Medium haptic feedback"
        >
          <HapticTypeFields type="medium" control={form.control} />
        </ConfigFormSection>

        <ConfigFormSection
          title="Heavy Haptic"
          description="Strong haptic feedback"
        >
          <HapticTypeFields type="heavy" control={form.control} />
        </ConfigFormSection>

        <ConfigFormSection
          title="Button Haptic"
          description="Haptic for button presses"
        >
          <HapticTypeFields type="button" control={form.control} />
        </ConfigFormSection>

        <ConfigFormSection
          title="Success Haptic"
          description="Haptic for success events"
        >
          <HapticTypeFields type="success" control={form.control} />
        </ConfigFormSection>

        <ConfigFormSection
          title="Error Haptic"
          description="Haptic for error events"
        >
          <HapticTypeFields type="error" control={form.control} />
        </ConfigFormSection>

        <ConfigActions
          onSave={handleSubmit}
          onCancel={onCancel}
          hasChanges={hasChanges}
          isValid={isValid}
          isSaving={isSaving}
          showExport={false}
          showImport={false}
        />
      </form>
    </Form>
  );
}

