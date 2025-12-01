'use client';

import * as React from 'react';
import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { 
  ChevronDown, 
  X, 
  Coins,
  FolderOpen 
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
import { ReadOnlyField, ReadOnlyFieldGroup } from '@/components/ui/ReadOnlyField';
import { 
  type EconomyConfig, 
  type Currency,
  defaultCurrency 
} from '@/lib/validations/economyConfig';

interface CurrenciesSectionProps {
  onSave?: (data: Currency[]) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

export function CurrenciesSection({ onSave, isSaving = false, readOnly = false }: CurrenciesSectionProps) {
  const form = useFormContext<EconomyConfig>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'currencies',
  });

  const handleAdd = () => {
    const newCurrency: Currency = {
      ...defaultCurrency,
      id: `currency_${fields.length + 1}`,
      displayName: `Currency ${fields.length + 1}`,
    };
    append(newCurrency);
    setExpandedIndex(fields.length);
  };

  const handleClearAll = () => {
    // Remove all items
    for (let i = fields.length - 1; i >= 0; i--) {
      remove(i);
    }
    setExpandedIndex(null);
  };

  const handleRemove = (index: number) => {
    remove(index);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Get current currencies data for save
  const currencies = form.watch('currencies');

  // Handle save - pass current currencies data
  const handleSave = () => {
    if (onSave) {
      onSave(currencies);
    }
  };

  return (
    <SectionWrapper
      title="Currency Definitions"
      description="Define in-game currencies with starting balances and constraints"
      onAdd={readOnly ? undefined : handleAdd}
      onClearAll={readOnly ? undefined : handleClearAll}
      onSave={readOnly ? undefined : handleSave}
      isSaving={isSaving}
      addButtonText="Add Currency"
      itemCount={fields.length}
      readOnly={readOnly}
    >
      {fields.length === 0 ? (
        <div className="empty-state">
          <Coins className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No currencies defined</p>
          <p className="text-xs text-muted-foreground/70">
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
                    ? 'border-primary/40 bg-card shadow-stripe-md' 
                    : 'border-border/40 bg-card/50 hover:border-border/60 hover:shadow-stripe-sm'
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
                          <p className="text-xs text-muted-foreground">
                            Starting: {currency?.startingBalance || 0} • Max: {currency?.maxValue === 0 ? 'Unlimited' : currency?.maxValue}
                          </p>
                        </div>
                      </div>
                      {!readOnly && (
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
                      )}
                    </div>
                  </CollapsibleTrigger>

                  {/* Expanded Content */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-6 border-t border-border/30 pt-4">
                      {readOnly ? (
                        /* Read-only display */
                        <>
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Identity
                            </h4>
                            <ReadOnlyFieldGroup className="pl-3">
                              <ReadOnlyField label="ID" value={currency?.id} />
                              <ReadOnlyField label="Display Name" value={currency?.displayName} />
                            </ReadOnlyFieldGroup>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Configuration
                            </h4>
                            <div className="space-y-4 pl-3">
                              <ReadOnlyField label="Description" value={currency?.description} />
                              <ReadOnlyField label="Icon Path" value={currency?.iconPath} />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Balance & Constraints
                            </h4>
                            <ReadOnlyFieldGroup className="pl-3">
                              <ReadOnlyField label="Starting Balance" value={currency?.startingBalance} />
                              <ReadOnlyField 
                                label="Max Value" 
                                value={currency?.maxValue === 0 ? 'Unlimited' : currency?.maxValue} 
                              />
                              <ReadOnlyField 
                                label="Allow Negative" 
                                value={currency?.allowNegative} 
                              />
                            </ReadOnlyFieldGroup>
                          </div>
                        </>
                      ) : (
                        /* Editable form fields */
                        <>
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
                                        className="h-9 bg-muted/30"
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
                                        className="h-9 bg-muted/30"
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
                                        className="min-h-[80px] resize-none bg-muted/30"
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
                                    <div className="flex gap-2">
                                      <FormControl>
                                        <Input 
                                          {...field} 
                                          placeholder="Assets/Icons/coin.png"
                                          className="h-9 bg-muted/30 flex-1"
                                        />
                                      </FormControl>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-3"
                                      >
                                        <FolderOpen className="h-4 w-4 mr-1.5" />
                                        Browse
                                      </Button>
                                    </div>
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
                                    <FormLabel className="text-xs">Default Balance</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min={0}
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className="h-9 bg-muted/30 max-w-[200px]"
                                      />
                                    </FormControl>
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
                                    <FormLabel className="text-xs">Max Value (0 = unlimited)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min={0}
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className="h-9 bg-muted/30 max-w-[200px]"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`currencies.${index}.allowNegative`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 p-4">
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

