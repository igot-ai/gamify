'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  ChevronDown, 
  X, 
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/switch';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/Form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { SectionWrapper } from './shared/SectionWrapper';
import { useArrayFieldManagement } from '@/hooks/useArrayFieldManagement';
import { 
  type EconomyConfig, 
  type Currency,
  defaultCurrency 
} from '@/lib/validations/economyConfig';
import { 
  transformCurrenciesToUnity, 
  transformCurrenciesFromUnity 
} from '@/lib/economyExportTransform';

interface CurrenciesSectionProps {
  onSave?: (data: Currency[]) => void;
  isSaving?: boolean;
}

export function CurrenciesSection({ onSave, isSaving = false }: CurrenciesSectionProps) {
  const form = useFormContext<EconomyConfig>();
  
  const {
    fields,
    expandedIndex,
    originalData: originalCurrencies,
    currentData: currencies,
    handleAdd,
    handleClearAll,
    handleRemove,
    toggleExpanded,
    handleSave,
    handleJsonChange,
  } = useArrayFieldManagement({
    form,
    fieldName: 'currencies',
    createDefaultItem: (fieldsLength): Currency => ({
      ...defaultCurrency,
      id: `currency_${fieldsLength + 1}`,
      displayName: `Currency ${fieldsLength + 1}`,
    }),
    onSave,
  });

  return (
    <SectionWrapper
      title="Currency Definitions"
      description="Define in-game currencies with starting balances and constraints"
      onAdd={handleAdd}
      onClearAll={handleClearAll}
      onSave={handleSave}
      isSaving={isSaving}
      addButtonText="Add Currency"
      itemCount={fields.length}
      jsonData={currencies}
      originalJsonData={originalCurrencies}
      onJsonChange={handleJsonChange}
      transformToUnity={transformCurrenciesToUnity}
      transformFromUnity={transformCurrenciesFromUnity}
    >
      {fields.length === 0 ? (
        <div className="empty-state">
          <Coins className="h-12 w-12 text-foreground/50 mb-3" />
          <p className="text-sm text-foreground/80 mb-1">No currencies defined</p>
          <p className="text-xs text-foreground/60">
            Add your first currency to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const currency = form.watch(`currencies.${index}`);
            const isExpanded = expandedIndex === index;
            const displayName = currency?.displayName || currency?.name || currency?.id || 'Unnamed Currency';

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
                        <Coins className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {currency?.id} ({displayName})
                          </p>
                          <p className="text-xs text-foreground/70">
                            Starting: {currency?.startingBalance || 0} • Max: {currency?.maxValue === 0 ? 'Unlimited' : currency?.maxValue}
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
                      {/* Identity Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Identity
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                              <FormField
                                control={form.control}
                                name={`currencies.${index}.id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">ID</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="currency_coin"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`currencies.${index}.displayName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Display Name</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="Coin"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Configuration Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Configuration
                            </h4>
                            <div className="space-y-4 pl-3">
                              <FormField
                                control={form.control}
                                name={`currencies.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Description</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        placeholder="Description of this currency..."
                                        className="min-h-[80px] resize-none"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`currencies.${index}.iconPath`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Currency Icon Path</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field}
                                        placeholder="Assets/Icons/coin.png"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Starting Balance Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Starting Balance
                            </h4>
                            <div className="pl-3">
                              <FormField
                                control={form.control}
                                name={`currencies.${index}.startingBalance`}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center gap-2">
                                      <FormLabel className="text-xs whitespace-nowrap">Default Balance</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number"
                                          min={0}
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                          placeholder="0"
                                          className="h-9 max-w-[200px]"
                                        />
                                      </FormControl>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Constraints Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Constraints
                            </h4>
                            <div className="space-y-4 pl-3">
                              <FormField
                                control={form.control}
                                name={`currencies.${index}.maxValue`}
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center gap-2">
                                      <FormLabel className="text-xs whitespace-nowrap">Max Value (0 = unlimited)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number"
                                          min={0}
                                          {...field}
                                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                          placeholder="0"
                                          className="h-9 max-w-[200px]"
                                        />
                                      </FormControl>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`currencies.${index}.allowNegative`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-sm">Allow Negative</FormLabel>
                                      <FormDescription className="text-xs">
                                        Allow this currency to have negative values
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
                            </div>
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

