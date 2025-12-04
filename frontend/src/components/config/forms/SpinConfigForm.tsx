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
import { RewardSlotEditor } from '../spin/RewardSlotEditor';
import {
  spinConfigSchema,
  defaultSpinConfig,
  type SpinConfig,
} from '@/lib/validations/spinConfig';
import { useSectionConfig, useSectionConfigVersions } from '@/hooks/useSectionConfigs';
import { useSelectedGame } from '@/hooks/useSelectedGame';
import type { EconomyConfig, Currency, InventoryItem } from '@/lib/validations/economyConfig';

interface SpinConfigFormProps {
  initialData?: SpinConfig;
  onSubmit: (data: SpinConfig) => void;
  onChange?: (data: SpinConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface SpinConfigFormRef {
  getData: () => SpinConfig;
  reset: (data: SpinConfig) => void;
}

export const SpinConfigForm = forwardRef<SpinConfigFormRef, SpinConfigFormProps>(
  function SpinConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
  }, ref) {
    // Fetch economy config to get currencies and inventory items
    const { selectedGame } = useSelectedGame();
    const { data: economyConfig } = useSectionConfig({
      game_id: selectedGame?.app_id || '',
      section_type: 'economy',
    });
    
    // Fetch economy versions to get the config data
    const { data: economyVersionsData } = useSectionConfigVersions(economyConfig?.id || '');
    
    // Extract currencies and inventory items from the latest economy version
    const latestEconomyVersion = economyVersionsData?.versions?.[0];
    const economyData = latestEconomyVersion?.config_data as EconomyConfig | undefined;
    const currencies: Currency[] = economyData?.currencies || [];
    const inventoryItems: InventoryItem[] = economyData?.inventoryItems || [];

    const mergedDefaults = initialData
      ? {
          ...defaultSpinConfig,
          ...initialData,
        }
      : defaultSpinConfig;

    const form = useForm<SpinConfig>({
      resolver: zodResolver(spinConfigSchema),
      defaultValues: mergedDefaults,
    });

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: SpinConfig) => form.reset(data),
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

    // Watch reward_slots for the editor
    const rewardSlots = form.watch('reward_slots') || [];

    return (
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <ConfigFormSection
            title="Spin Settings"
            description="Configure the spin wheel feature"
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
                        Determines whether the spin feature is enabled
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="min_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>
                        The minimum level a player must reach to unlock the spin wheel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="free_spin_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Spin Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        How many free spins players get without watching ads
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ad_spin_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Spin Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of spins players can earn by watching ads
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cooldown_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cooldown Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        How many hours players must wait before getting free spins again
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </ConfigFormSection>

          {/* Reward Slots */}
          <ConfigFormSection
            title="Reward Slots"
            description="Define the prizes available on the spin wheel"
          >
            <RewardSlotEditor
              title="Spin Wheel Rewards"
              description="Define what rewards players can win from spinning"
              items={rewardSlots}
              onChange={(items) => form.setValue('reward_slots', items, { shouldDirty: true })}
              currencies={currencies}
              inventoryItems={inventoryItems}
              addButtonText="Add Slot"
            />
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
