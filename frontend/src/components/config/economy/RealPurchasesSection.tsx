'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  ChevronDown, 
  X, 
  CreditCard,
  Plus as PlusIcon,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
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
import { ReadOnlyField, ReadOnlyFieldGroup } from '@/components/ui/ReadOnlyField';
import { useArrayFieldManagement } from '@/hooks/useArrayFieldManagement';
import { 
  type EconomyConfig, 
  type RealPurchase,
  defaultRealPurchase 
} from '@/lib/validations/economyConfig';
import { 
  transformRealPurchasesToUnity, 
  transformRealPurchasesFromUnity 
} from '@/lib/economyExportTransform';

interface RealPurchasesSectionProps {
  onSave?: (data: RealPurchase[]) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

export function RealPurchasesSection({ onSave, isSaving = false, readOnly = false }: RealPurchasesSectionProps) {
  const form = useFormContext<EconomyConfig>();

  // Get available currencies and items for reward selection
  const currencies = form.watch('currencies') || [];
  const inventoryItems = form.watch('inventoryItems') || [];

  const {
    fields,
    expandedIndex,
    originalData: originalPurchases,
    currentData: realPurchases,
    handleAdd,
    handleClearAll,
    handleRemove,
    toggleExpanded,
    handleSave,
    handleJsonChange,
  } = useArrayFieldManagement({
    form,
    fieldName: 'realPurchases',
    createDefaultItem: (fieldsLength) => ({
      ...defaultRealPurchase,
      productId: `studio.game.product${fieldsLength + 1}`,
      displayName: `Product ${fieldsLength + 1}`,
      productType: 'Consumable' as const,
      rewards: [],
      bonuses: [],
    }),
    onSave,
  });

  return (
    <SectionWrapper
      title="Real Money Product Definitions"
      description="Configure In-App Purchases (IAP) with real money"
      onAdd={readOnly ? undefined : handleAdd}
      onClearAll={readOnly ? undefined : handleClearAll}
      onSave={readOnly ? undefined : handleSave}
      isSaving={isSaving}
      addButtonText="Add Product"
      itemCount={fields.length}
      readOnly={readOnly}
      jsonData={realPurchases}
      originalJsonData={originalPurchases}
      onJsonChange={readOnly ? undefined : handleJsonChange}
      transformToUnity={transformRealPurchasesToUnity}
      transformFromUnity={transformRealPurchasesFromUnity}
    >
      {fields.length === 0 ? (
        <div className="empty-state">
          <CreditCard className="h-12 w-12 text-foreground/50 mb-3" />
          <p className="text-sm text-foreground/80 mb-1">No IAP products defined</p>
          <p className="text-xs text-foreground/60">
            {readOnly ? 'No IAP products in this configuration' : 'Add your first real money product to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const purchase = form.watch(`realPurchases.${index}`);
            const isExpanded = expandedIndex === index;
            const displayName = purchase?.displayName || purchase?.productId || 'Unnamed Product';
            const isConsumable = purchase?.productType === 'Consumable';

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
                        <CreditCard className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {purchase?.productId} ({displayName})
                          </p>
                          <p className="text-xs text-foreground/70">
                            <span className="inline-flex items-center gap-1">
                              <PlusIcon className="h-3 w-3" />
                              Rewards: {purchase?.rewards?.length || 0}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isConsumable ? 'secondary' : 'outline'}
                          className={cn(
                            'text-xs',
                            isConsumable 
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' 
                              : 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                          )}
                        >
                          {purchase?.productType || 'Consumable'}
                        </Badge>
                        {!readOnly && (
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
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-6 border-t border-border/70 pt-4">
                      {readOnly ? (
                        /* Read-only display */
                        <>
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Identity
                            </h4>
                            <ReadOnlyFieldGroup className="pl-3">
                              <ReadOnlyField label="Product ID" value={purchase?.productId} />
                              <ReadOnlyField label="Display Name" value={purchase?.displayName} />
                              <ReadOnlyField label="Product Type" value={purchase?.productType} />
                            </ReadOnlyFieldGroup>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <PlusIcon className="h-4 w-4 text-green-500" />
                              Rewards ({purchase?.rewards?.length || 0})
                            </h4>
                            <div className="pl-3 space-y-2">
                              {purchase?.rewards?.length > 0 ? (
                                purchase.rewards.map((reward: any, idx: number) => (
                                  <div key={idx} className="text-sm py-2 px-3 bg-muted/30 rounded-md border border-border/50">
                                    <span className="font-medium">{reward.id}</span>
                                    <span className="text-foreground/70 ml-2">× {reward.amount}</span>
                                    <span className="text-xs text-foreground/70 ml-2">({reward.type})</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-foreground/70 italic">No rewards defined</p>
                              )}
                            </div>
                          </div>

                          {purchase?.bonuses?.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Bonuses ({purchase.bonuses.length})
                              </h4>
                              <div className="pl-3 space-y-2">
                                {purchase.bonuses.map((bonus: any, idx: number) => (
                                  <div key={idx} className="text-sm py-2 px-3 bg-amber-500/10 rounded-md border border-amber-500/30">
                                    <span className="font-medium">{bonus.triggerType}</span>
                                    <span className="text-foreground/70 ml-2">
                                      {bonus.rewards?.length || 0} bonus rewards
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* Editable form fields */
                        <>
                          {/* Identity Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Identity
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                              <FormField
                                control={form.control}
                                name={`realPurchases.${index}.productId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Product ID</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="studio.sun.tileadventure.noads"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`realPurchases.${index}.displayName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Display Name</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="Remove Ads"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="pl-3">
                              <FormField
                                control={form.control}
                                name={`realPurchases.${index}.productType`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Product Type</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-9 max-w-[250px]">
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="Consumable">
                                          <div className="flex items-center gap-2">
                                            <Tag className="h-3.5 w-3.5 text-blue-500" />
                                            <span>Consumable</span>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="NonConsumable">
                                          <div className="flex items-center gap-2">
                                            <Tag className="h-3.5 w-3.5 text-purple-500" />
                                            <span>Non Consumable</span>
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Rewards Section */}
                          <div className="space-y-4 pl-3">
                            <CostRewardEditor
                              title="Rewards (What player receives)"
                              description="Define what resources the player receives after purchase"
                              items={purchase?.rewards || []}
                              onChange={(items) => form.setValue(`realPurchases.${index}.rewards`, items)}
                              currencies={currencies}
                              inventoryItems={inventoryItems}
                              addButtonText="Add Reward"
                            />
                          </div>

                          {/* Bonuses Section */}
                          <div className="space-y-4 pl-3">
                            <BonusEditor
                              items={purchase?.bonuses || []}
                              onChange={(items) => form.setValue(`realPurchases.${index}.bonuses`, items)}
                              currencies={currencies}
                              inventoryItems={inventoryItems}
                            />
                          </div>
                        </>
                      )}
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
