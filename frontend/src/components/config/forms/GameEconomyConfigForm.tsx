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
import { gameEconomyConfigSchema, type GameEconomyConfig } from '@/lib/validations/gameEconomyConfig';

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
  reset: (data: GameEconomyConfig) => void;
}

export const GameEconomyConfigForm = forwardRef<GameEconomyConfigFormRef, GameEconomyConfigFormProps>(
  function GameEconomyConfigForm({ initialData, onSubmit, onChange, onCancel, isSaving = false }, ref) {
    const [originalData, setOriginalData] = useState<GameEconomyConfig | undefined>();
    const initializedRef = useRef(false);

    const form = useForm<GameEconomyConfig>({
      resolver: zodResolver(gameEconomyConfigSchema),
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
      const sub = form.watch((data) => onChange?.(data as GameEconomyConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: GameEconomyConfig) => {
        form.reset(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
      },
    }));

    return (
      <Form {...form}>
        <FormWithJsonTabs formData={form.watch()} originalData={originalData} onJsonChange={(data) => form.reset(data)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection title="Game Economy Settings" description="Configure coin costs and rewards for game economy" collapsible={false}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="revive_coin_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revive Coin Cost</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Cost in coins to revive and continue playing</FormDescription>
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
                        <Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Coin reward for completing a level after watching an ad</FormDescription>
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
                        <Input type="number" min={0} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormDescription>Coin reward for completing a scenery</FormDescription>
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
