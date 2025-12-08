'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  ChevronDown, 
  X, 
  ShoppingCart,
  Minus,
  Plus as PlusIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { SectionWrapper } from './shared/SectionWrapper';
import { CostRewardEditor } from './shared/CostRewardEditor';
import { BonusEditor } from './shared/BonusEditor';
import { useArrayFieldManagement } from '@/hooks/useArrayFieldManagement';
import { 
  type EconomyConfig, 
  type VirtualPurchase,
  defaultVirtualPurchase 
} from '@/lib/validations/economyConfig';
import { 
  transformVirtualPurchasesToUnity, 
  transformVirtualPurchasesFromUnity 
} from '@/lib/economyExportTransform';

interface VirtualPurchasesSectionProps {
  onSave?: (data: VirtualPurchase[]) => void;
  isSaving?: boolean;
}

export function VirtualPurchasesSection({ onSave, isSaving = false }: VirtualPurchasesSectionProps) {
  const form = useFormContext<EconomyConfig>();

  // Get available currencies and items for cost/reward selection
  const currencies = form.watch('currencies') || [];
  const inventoryItems = form.watch('inventoryItems') || [];

  const {
    fields,
    expandedIndex,
    originalData: originalPurchases,
    currentData: virtualPurchases,
    handleAdd,
    handleClearAll,
    handleRemove,
    toggleExpanded,
    handleSave,
    handleJsonChange,
  } = useArrayFieldManagement({
    form,
    fieldName: 'virtualPurchases',
    createDefaultItem: (fieldsLength): VirtualPurchase => ({
      ...defaultVirtualPurchase,
      id: `purchase_${fieldsLength + 1}`,
      name: `Purchase ${fieldsLength + 1}`,
      costs: [],
      rewards: [],
      bonuses: [],
    }),
    onSave,
  });

  return (
    <SectionWrapper
      title="Virtual Purchase Definitions"
      description="Configure purchases using in-game currencies and items"
      onAdd={handleAdd}
      onClearAll={handleClearAll}
      onSave={handleSave}
      isSaving={isSaving}
      addButtonText="Add Purchase"
      itemCount={fields.length}
      jsonData={virtualPurchases}
      originalJsonData={originalPurchases}
      onJsonChange={handleJsonChange}
      transformToUnity={transformVirtualPurchasesToUnity}
      transformFromUnity={transformVirtualPurchasesFromUnity}
    >
      {fields.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart className="h-12 w-12 text-foreground/50 mb-3" />
          <p className="text-sm text-foreground/80 mb-1">No virtual purchases defined</p>
          <p className="text-xs text-foreground/60">
            Add your first virtual purchase to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const purchase = form.watch(`virtualPurchases.${index}`);
            const isExpanded = expandedIndex === index;
            const displayName = purchase?.name || purchase?.id || 'Unnamed Purchase';

            return (
              <Collapsible
                key={field.id}
                open={isExpanded}
                onOpenChange={() => toggleExpanded(index)}
              >
                <div className={cn(
                  'rounded-lg border transition-all duration-200',
                  isExpanded 
                    ? 'border-primary/70 bg-card shadow-stripe-md' 
                    : 'border-border/80 bg-card/50 hover:border-border hover:shadow-stripe-sm'
                )}>
                  {/* Collapsed Header */}
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <ChevronDown className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )} />
                        <ShoppingCart className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {purchase?.id} ({displayName})
                          </p>
                          <p className="text-xs text-foreground/70">
                            <span className="inline-flex items-center gap-1">
                              <Minus className="h-3 w-3" />
                              Costs: {purchase?.costs?.length || 0}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="inline-flex items-center gap-1">
                              <PlusIcon className="h-3 w-3" />
                              Rewards: {purchase?.rewards?.length || 0}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(index);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-6 border-t border-border/70 pt-4">
                      {/* Purchase Information */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                              Purchase Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                              <FormField
                                control={form.control}
                                name={`virtualPurchases.${index}.id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">ID</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="purchase_hint_with_coin"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`virtualPurchases.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Name</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="Purchase Hint"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Costs Section */}
                          <div className="space-y-4 pl-3">
                            <CostRewardEditor
                              title="Costs (What player pays)"
                              description="Define what resources the player must spend"
                              items={purchase?.costs || []}
                              onChange={(items) => form.setValue(`virtualPurchases.${index}.costs`, items)}
                              currencies={currencies}
                              inventoryItems={inventoryItems}
                              addButtonText="Add Cost"
                            />
                          </div>

                          {/* Rewards Section */}
                          <div className="space-y-4 pl-3">
                            <CostRewardEditor
                              title="Rewards (What player receives)"
                              description="Define what resources the player receives"
                              items={purchase?.rewards || []}
                              onChange={(items) => form.setValue(`virtualPurchases.${index}.rewards`, items)}
                              currencies={currencies}
                              inventoryItems={inventoryItems}
                              addButtonText="Add Reward"
                            />
                          </div>

                      {/* Bonuses Section */}
                      <div className="space-y-4 pl-3">
                        <BonusEditor
                          items={purchase?.bonuses || []}
                          onChange={(items) => form.setValue(`virtualPurchases.${index}.bonuses`, items)}
                          currencies={currencies}
                          inventoryItems={inventoryItems}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
}
