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
  gameEconomyConfigSchema,
  type GameEconomyConfig,
} from '@/lib/validations/gameEconomyConfig';

const DEFAULT_CONFIG: GameEconomyConfig = {
  revive_coin_cost: 300,
  ad_level_complete_coin_reward: 50,
  scenery_complete_coin_reward: 50,
};

interface GameEconomyConfigFormProps {
  initialData?: GameEconomyConfig;
  onSubmit: (data: GameEconomyConfig) => void;
  onChange?: (data: GameEconomyConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface GameEconomyConfigFormRef {
  getData: () => GameEconomyConfig;
}

export const GameEconomyConfigForm = forwardRef<GameEconomyConfigFormRef, GameEconomyConfigFormProps>(
  function GameEconomyConfigForm({
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

    const form = useForm<GameEconomyConfig>({
      resolver: zodResolver(gameEconomyConfigSchema),
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
            title="Game Economy Settings"
            description="Configure coin costs and rewards for game economy"
            collapsible={false}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="revive_coin_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revive Coin Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Cost in coins to revive and continue playing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ad_level_complete_coin_reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Level Complete Coin Reward</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Coin reward for completing a level after watching an ad
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scenery_complete_coin_reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scenery Complete Coin Reward</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Coin reward for completing a scenery
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

