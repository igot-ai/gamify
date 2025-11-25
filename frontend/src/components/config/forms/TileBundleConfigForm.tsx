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
import { Switch } from '@/components/ui/switch';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { ConfigActions } from '../shared/ConfigActions';
import {
  tileBundleConfigSchema,
  type TileBundleConfig,
} from '@/lib/validations/tileBundleConfig';

const DEFAULT_CONFIG: TileBundleConfig = {
  enabled: true,
  discount: 80,
  min_level: 20,
  days_played_trigger: 2,
  sessions_played_trigger: 1,
  duration_hours: 24,
  max_lifetime_shows: 2,
  max_session_shows: 1,
  cooldown_popup_hours: 48,
  cooldown_offer_hours: 48,
};

interface TileBundleConfigFormProps {
  initialData?: TileBundleConfig;
  onSubmit: (data: TileBundleConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function TileBundleConfigForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving = false,
}: TileBundleConfigFormProps) {
  const mergedDefaults: TileBundleConfig = {
    ...DEFAULT_CONFIG,
    ...(initialData ?? {}),
    enabled: initialData?.enabled ?? DEFAULT_CONFIG.enabled,
  };

  const form = useForm<TileBundleConfig>({
    resolver: zodResolver(tileBundleConfigSchema),
    defaultValues: mergedDefaults,
  });

  const hasChanges = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ConfigFormSection
          title="Tile Bundle Offer Configuration"
          description="Configure the tile bundle special offer settings"
          defaultOpen={true}
          collapsible={false}
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Tile Bundle Offer</FormLabel>
                    <FormDescription>
                      Show tile bundle offer popup to players
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Discount percentage (0-100)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum player level to show offer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="days_played_trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days Played Trigger</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of days played to trigger offer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessions_played_trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sessions Played Trigger</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of sessions played to trigger offer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      How long the offer lasts (in hours)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_lifetime_shows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Lifetime Shows</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum times to show across player lifetime
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_session_shows"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Session Shows</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum times to show per session
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cooldown_popup_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cooldown Popup (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Cooldown period between popup shows
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cooldown_offer_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cooldown Offer (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Cooldown period between offer availability
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
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

