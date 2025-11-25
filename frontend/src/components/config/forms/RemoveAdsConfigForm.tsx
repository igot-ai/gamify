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
  removeAdsConfigSchema,
  type RemoveAdsConfig,
} from '@/lib/validations/removeAdsConfig';

const DEFAULT_CONFIG: RemoveAdsConfig = {
  enabled: true,
  min_level: 5,
  ad_watched_trigger: 4,
  days_played_trigger: 2,
  duration_hours: 24,
  max_lifetime_shows: 4,
  max_session_shows: 1,
  cooldown_popup_hours: 24,
  cooldown_offer_hours: 24,
};

interface RemoveAdsConfigFormProps {
  initialData?: RemoveAdsConfig;
  onSubmit: (data: RemoveAdsConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export function RemoveAdsConfigForm({
  initialData,
  onSubmit,
  onCancel,
  isSaving = false,
}: RemoveAdsConfigFormProps) {
  const mergedDefaults: RemoveAdsConfig = {
    ...DEFAULT_CONFIG,
    ...(initialData ?? {}),
    enabled: initialData?.enabled ?? DEFAULT_CONFIG.enabled,
  };

  const form = useForm<RemoveAdsConfig>({
    resolver: zodResolver(removeAdsConfigSchema),
    defaultValues: mergedDefaults,
  });

  const hasChanges = form.formState.isDirty;
  const isValid = form.formState.isValid;
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <ConfigFormSection
          title="Remove Ads Offer Configuration"
          description="Configure the remove ads offer popup settings"
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
                    <FormLabel className="text-base">Enable Remove Ads Offer</FormLabel>
                    <FormDescription>
                      Show remove ads offer popup to players
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
                name="ad_watched_trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Watched Trigger</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Number of ads watched to trigger offer
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

