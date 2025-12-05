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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { FormWithJsonTabs } from '../shared/FormWithJsonTabs';
import { RewardSlotEditor } from '../spin/RewardSlotEditor';
import {
  spinConfigSchema,
  defaultSpinConfig,
  type SpinConfig,
} from '@/lib/validations/spinConfig';
import { useSectionConfig, useSectionConfigVersions } from '@/hooks/useSectionConfigs';
import { useSelectedGame } from '@/hooks/useSelectedGame';
import type { EconomyConfig, Currency, InventoryItem } from '@/lib/validations/economyConfig';
import { transformSpinConfigToExport } from '@/lib/spinExportTransform';
import { transformSpinConfigFromImport, transformEconomyConfigFromImport } from '@/lib/importTransforms';

const isValidConfig = (data: any): data is SpinConfig => {
  return data && typeof data.enabled === 'boolean';
};

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
    const [originalData, setOriginalData] = useState<SpinConfig | undefined>();
    const [selectedEconomyVersionId, setSelectedEconomyVersionId] = useState<string>('');
    const initializedRef = useRef(false);

    // Fetch economy config to get currencies and inventory items
    const { selectedGame } = useSelectedGame();
    const { data: economyConfig } = useSectionConfig({
      game_id: selectedGame?.app_id || '',
      section_type: 'economy',
    });
    
    // Fetch economy versions to get the config data
    const { data: economyVersionsData } = useSectionConfigVersions(economyConfig?.id || '');
    const economyVersions = economyVersionsData?.versions || [];
    
    // Auto-select first version when versions load
    useEffect(() => {
      if (economyVersions.length > 0 && !selectedEconomyVersionId) {
        setSelectedEconomyVersionId(economyVersions[0].id);
      }
    }, [economyVersions, selectedEconomyVersionId]);
    
    // Extract currencies and inventory items from selected economy version
    // Data may be in Unity format (PascalCase) so transform it first
    const selectedEconomyVersion = economyVersions.find(v => v.id === selectedEconomyVersionId);
    const rawEconomyData = selectedEconomyVersion?.config_data;
    const economyData = rawEconomyData ? transformEconomyConfigFromImport(rawEconomyData) : undefined;
    const currencies: Currency[] = economyData?.currencies || [];
    const inventoryItems: InventoryItem[] = economyData?.inventoryItems || [];

    const effectiveInitialData = isValidConfig(initialData)
      ? { ...defaultSpinConfig, ...initialData }
      : defaultSpinConfig;

    const form = useForm<SpinConfig>({
      resolver: zodResolver(spinConfigSchema),
      defaultValues: effectiveInitialData,
    });

    useEffect(() => {
      if (initialData) {
        const data = isValidConfig(initialData)
          ? { ...defaultSpinConfig, ...initialData }
          : defaultSpinConfig;
        setOriginalData(JSON.parse(JSON.stringify(data)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: SpinConfig) => {
        const resetData = isValidConfig(data)
          ? { ...defaultSpinConfig, ...data }
          : defaultSpinConfig;
        form.reset(resetData);
        setOriginalData(JSON.parse(JSON.stringify(resetData)));
      },
    }));

    useEffect(() => {
      const sub = form.watch((data) => onChange?.(data as SpinConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    // Watch reward_slots for the editor
    const rewardSlots = form.watch('reward_slots') || [];

    return (
      <Form {...form}>
        <FormWithJsonTabs
          formData={form.watch()}
          originalData={originalData}
          onJsonChange={(data) => form.reset(data)}
          transformToUnity={transformSpinConfigToExport}
          transformFromUnity={transformSpinConfigFromImport}
          onSave={() => onSubmit(form.getValues())}
          isSaving={isSaving}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            {/* Economy Version Selector */}
            <div className="mb-6 p-4 rounded-lg border border-border bg-muted/10">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Economy Version</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select which economy version to use for currencies and items
                  </p>
                </div>
                <Select
                  value={selectedEconomyVersionId}
                  onValueChange={setSelectedEconomyVersionId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select version..." />
                  </SelectTrigger>
                  <SelectContent>
                    {economyVersions.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        No economy versions available
                      </div>
                    ) : (
                      economyVersions.map((version, index) => (
                        <SelectItem key={version.id} value={version.id}>
                          {version.title || `Version ${economyVersions.length - index}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {currencies.length > 0 || inventoryItems.length > 0 ? (
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span>{currencies.length} currencies</span>
                  <span>{inventoryItems.length} inventory items</span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-amber-500">
                  No currencies or items found in selected economy version
                </p>
              )}
            </div>

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
