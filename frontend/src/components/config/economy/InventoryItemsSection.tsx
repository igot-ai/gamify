'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { 
  ChevronDown, 
  X, 
  Package,
  Layers
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
  type InventoryItem,
  defaultInventoryItem 
} from '@/lib/validations/economyConfig';

interface InventoryItemsSectionProps {
  onSave?: (data: InventoryItem[]) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

export function InventoryItemsSection({ onSave, isSaving = false, readOnly = false }: InventoryItemsSectionProps) {
  const form = useFormContext<EconomyConfig>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [originalItems, setOriginalItems] = useState<InventoryItem[]>([]);
  const initializedRef = useRef(false);

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'inventoryItems',
  });

  // Get current items data for save and JSON sync
  const inventoryItems = form.watch('inventoryItems');

  // Store original items on initial load for diff comparison
  useEffect(() => {
    if (!initializedRef.current && inventoryItems && Array.isArray(inventoryItems)) {
      setOriginalItems(JSON.parse(JSON.stringify(inventoryItems)));
      initializedRef.current = true;
    }
  }, [inventoryItems]);

  const handleAdd = () => {
    const newItem: InventoryItem = {
      ...defaultInventoryItem,
      id: `item_${fields.length + 1}`,
      displayName: `Item ${fields.length + 1}`,
    };
    append(newItem);
    setExpandedIndex(fields.length);
  };

  const handleClearAll = () => {
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

  // Handle save - pass current inventory items data
  const handleSave = () => {
    if (onSave) {
      const itemsToSave = inventoryItems || [];
      onSave(itemsToSave);
      // Update original after save
      if (Array.isArray(itemsToSave)) {
        setOriginalItems(JSON.parse(JSON.stringify(itemsToSave)));
      } else {
        setOriginalItems([]);
      }
    }
  };

  // Handle JSON changes from the JSON editor
  const handleJsonChange = (data: InventoryItem[]) => {
    if (Array.isArray(data)) {
      replace(data);
    }
  };

  return (
    <SectionWrapper
      title="Inventory Item Definitions"
      description="Define items that players can collect and use in the game"
      onAdd={readOnly ? undefined : handleAdd}
      onClearAll={readOnly ? undefined : handleClearAll}
      onSave={readOnly ? undefined : handleSave}
      isSaving={isSaving}
      addButtonText="Add Item"
      itemCount={fields.length}
      readOnly={readOnly}
      jsonData={inventoryItems}
      originalJsonData={originalItems}
      onJsonChange={readOnly ? undefined : handleJsonChange}
    >
      {fields.length === 0 ? (
        <div className="empty-state">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No items defined</p>
          <p className="text-xs text-muted-foreground/70">
            {readOnly ? 'No inventory items in this configuration' : 'Add your first inventory item to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const item = form.watch(`inventoryItems.${index}`);
            const isExpanded = expandedIndex === index;
            const displayName = item?.displayName || item?.id || 'Unnamed Item';

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
                        <Package className="h-4 w-4 text-secondary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item?.id} ({displayName})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item?.startingQuantity || 0} • 
                            {item?.isStackable ? ` Stackable (max: ${item?.maxStackSize === 0 ? '∞' : item?.maxStackSize})` : ' Not stackable'}
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
                    <div className="px-4 pb-4 space-y-6 border-t border-border/70 pt-4">
                      {readOnly ? (
                        /* Read-only display */
                        <>
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              Identity
                            </h4>
                            <ReadOnlyFieldGroup className="pl-3">
                              <ReadOnlyField label="ID" value={item?.id} />
                              <ReadOnlyField label="Display Name" value={item?.displayName} />
                            </ReadOnlyFieldGroup>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              Configuration
                            </h4>
                            <div className="space-y-4 pl-3">
                              <ReadOnlyField label="Description" value={item?.description} />
                              <ReadOnlyField label="Icon Path" value={item?.iconPath} />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <Layers className="h-4 w-4 text-secondary" />
                              Quantity & Stacking
                            </h4>
                            <ReadOnlyFieldGroup className="pl-3">
                              <ReadOnlyField label="Starting Quantity" value={item?.startingQuantity} />
                              <ReadOnlyField label="Is Stackable" value={item?.isStackable} />
                              <ReadOnlyField 
                                label="Max Stack Size" 
                                value={item?.maxStackSize === 0 ? 'Unlimited' : item?.maxStackSize} 
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
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              Identity
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
                              <FormField
                                control={form.control}
                                name={`inventoryItems.${index}.id`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">ID</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="item_undo"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`inventoryItems.${index}.displayName`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Display Name</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        placeholder="Undo"
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
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              Configuration
                            </h4>
                            <div className="space-y-4 pl-3">
                              <FormField
                                control={form.control}
                                name={`inventoryItems.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Description</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        {...field} 
                                        placeholder="Description of this item..."
                                        className="min-h-[80px] resize-none"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`inventoryItems.${index}.iconPath`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Item Icon Path</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field}
                                        placeholder="Assets/Icons/undo.png"
                                        className="h-9"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Starting Quantity Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              Starting Quantity
                            </h4>
                            <div className="pl-3">
                              <FormField
                                control={form.control}
                                name={`inventoryItems.${index}.startingQuantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Default Quantity</FormLabel>
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
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Stacking Section */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <Layers className="h-4 w-4 text-secondary" />
                              Stacking
                            </h4>
                            <div className="space-y-4 pl-3">
                              <FormField
                                control={form.control}
                                name={`inventoryItems.${index}.isStackable`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-sm">Is Stackable</FormLabel>
                                      <FormDescription className="text-xs">
                                        Allow multiple of this item to stack together
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
                              <FormField
                                control={form.control}
                                name={`inventoryItems.${index}.maxStackSize`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Max Stack Size (0 = unlimited)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        min={0}
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className="h-9 max-w-[200px]"
                                        disabled={!form.watch(`inventoryItems.${index}.isStackable`)}
                                      />
                                    </FormControl>
                                    <FormMessage />
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
