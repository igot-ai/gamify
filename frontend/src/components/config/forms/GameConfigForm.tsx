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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { FormWithJsonTabs } from '../shared/FormWithJsonTabs';
import {
  gameConfigSchema,
  type GameConfig,
} from '@/lib/validations/gameConfig';

interface GameConfigFormProps {
  initialData?: GameConfig;
  onSubmit: (data: GameConfig) => void;
  onChange?: (data: GameConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export interface GameConfigFormRef {
  getData: () => GameConfig;
  reset: (data: GameConfig) => void;
}

const Vector2Field = ({ control, baseName, label }: { control: any; baseName: string; label: string }) => (
  <div className="space-y-2">
    <FormLabel className="text-sm text-muted-foreground">{label}</FormLabel>
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={`${baseName}.x`}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-4">X</span>
              <FormControl>
                <Input
                  type="number"
                  step="any"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  className="h-9 bg-muted/30"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${baseName}.y`}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-4">Y</span>
              <FormControl>
                <Input
                  type="number"
                  step="any"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                  className="h-9 bg-muted/30"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
);

export const GameConfigForm = forwardRef<GameConfigFormRef, GameConfigFormProps>(
  function GameConfigForm({ initialData, onSubmit, onChange, onCancel, isSaving = false }, ref) {
    const [originalData, setOriginalData] = useState<GameConfig | undefined>();
    const initializedRef = useRef(false);

    const form = useForm<GameConfig>({
      resolver: zodResolver(gameConfigSchema),
      defaultValues: initialData,
    });

    useEffect(() => {
      if (initialData) {
        setOriginalData(JSON.parse(JSON.stringify(initialData)));
        if (!initializedRef.current) {
          initializedRef.current = true;
        }
      }
    }, [initialData]);

    // Notify parent of changes
    useEffect(() => {
      const sub = form.watch((data) => onChange?.(data as GameConfig));
      return () => sub.unsubscribe();
    }, [form, onChange]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
      reset: (data: GameConfig) => {
        form.reset(data);
        setOriginalData(JSON.parse(JSON.stringify(data)));
      },
    }));

    return (
      <Form {...form}>
        <FormWithJsonTabs
          formData={form.watch()}
          originalData={originalData}
          onJsonChange={(data) => form.reset(data)}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ConfigFormSection title="Game Logic" description="Configure game logic parameters and combo settings">
              <div className="space-y-4">
                <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Game Logic Config
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="gameLogic.gameLogicConfig.matchCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Match Count</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                              className="h-9 bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gameLogic.gameLogicConfig.countUndoTileRevive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Count Undo Tile Revive</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                              className="h-9 bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gameLogic.gameLogicConfig.countShuffleTileRevive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Count Shuffle Tile Revive</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                              className="h-9 bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gameLogic.gameLogicConfig.countSlotHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Count Slot Holder</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                              className="h-9 bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gameLogic.gameLogicConfig.warningThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Warning Threshold</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                              className="h-9 bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Combo
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="gameLogic.combo.matchEffect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Match Effect</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                              className="h-9 bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gameLogic.combo.maxNoMatch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-muted-foreground">Max No Match</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                              className="h-9 bg-muted/30"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </ConfigFormSection>

            <ConfigFormSection title="View Config" description="Configure grid and holder view settings">
              <div className="space-y-4">
                <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Grid View
                  </h4>
                  <Vector2Field control={form.control} baseName="viewConfig.gridView.tileSize" label="Tile Size" />
                </div>

                <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Holder View
                  </h4>
                  <div className="space-y-4">
                    <Vector2Field control={form.control} baseName="viewConfig.holderView.slotSize" label="Slot Size" />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="viewConfig.holderView.slotSpace"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Slot Space</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                className="h-9 bg-muted/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="viewConfig.holderView.ratioBetweenTwoTile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Ratio Between Two Tile</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                className="h-9 bg-muted/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="viewConfig.holderView.slotYPadding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Slot Y Padding</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                className="h-9 bg-muted/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="viewConfig.holderView.tileInHolderYPadding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm text-muted-foreground">Tile In Holder Y Padding</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                className="h-9 bg-muted/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
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
