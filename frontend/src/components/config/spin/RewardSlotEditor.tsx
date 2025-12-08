'use client';

import * as React from 'react';
import { Plus, Trash2, Coins, Package, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Currency, InventoryItem } from '@/lib/validations/economyConfig';
import type { RewardSlot } from '@/lib/validations/spinConfig';

interface RewardSlotEditorProps {
  title: string;
  description?: string;
  items: RewardSlot[];
  onChange: (items: RewardSlot[]) => void;
  currencies: Currency[];
  inventoryItems: InventoryItem[];
  className?: string;
  minItems?: number;
  addButtonText?: string;
}

export function RewardSlotEditor({
  title,
  description,
  items,
  onChange,
  currencies,
  inventoryItems,
  className,
  minItems = 0,
  addButtonText = 'Add Slot',
}: RewardSlotEditorProps) {
  const handleAdd = () => {
    onChange([
      ...items,
      { item_id: '', amount: 1, probability: 0.25, upgrade_multiplier: 2 },
    ]);
  };

  const handleRemove = (index: number) => {
    if (items.length <= minItems) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (index: number, field: keyof RewardSlot, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange(newItems);
  };

  // Get item type from item_id prefix
  const getItemType = (itemId: string): 'Currency' | 'Item' => {
    const currency = currencies.find(c => c.id === itemId);
    if (currency) return 'Currency';
    return 'Item';
  };

  // Get resource options based on type
  const getResourceOptions = (type: 'Currency' | 'Item') => {
    if (type === 'Currency') {
      return currencies.map((c) => ({
        id: c.id,
        label: c.displayName || c.name || c.id,
      }));
    }
    return inventoryItems.map((item) => ({
      id: item.id,
      label: item.displayName || item.id,
    }));
  };

  return (
    <TooltipProvider>
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">{title}</Label>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="h-8 px-3"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {addButtonText}
          </Button>
        </div>

        {/* Column Headers */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 px-3 text-xs text-muted-foreground">
            <div className="w-[120px]">Type</div>
            <div className="flex-1 min-w-[180px]">Reward Item</div>
            <div className="w-[80px]">Quantity</div>
            <div className="w-[100px] flex items-center gap-1">
              Chance %
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p>Probability of landing on this slot (0-100%). All slots should add up to 100%.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="w-[100px] flex items-center gap-1">
              Upgrade ×
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p>Multiplier applied to quantity when slot is upgraded. E.g., 2× means double reward after upgrade.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="w-9"></div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 p-4 text-center">
            <p className="text-xs text-muted-foreground">No reward slots added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => {
              const itemType = getItemType(item.item_id);
              
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/10 transition-colors hover:bg-muted/20"
                >
                  {/* Type Selector */}
                  <Select
                    value={itemType}
                    onValueChange={(_value: 'Currency' | 'Item') => {
                      handleChange(index, 'item_id', '');
                    }}
                  >
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Currency">
                        <div className="flex items-center gap-2">
                          <Coins className="h-3.5 w-3.5" />
                          <span>Currency</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Item">
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          <span>Item</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Resource Selector */}
                  <Select
                    value={item.item_id}
                    onValueChange={(value) => handleChange(index, 'item_id', value)}
                  >
                    <SelectTrigger className="flex-1 h-9 min-w-[180px]">
                      <SelectValue placeholder="Select reward..." />
                    </SelectTrigger>
                    <SelectContent>
                      {getResourceOptions(itemType).map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label} ({option.id})
                        </SelectItem>
                      ))}
                      {getResourceOptions(itemType).length === 0 && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          No {itemType === 'Currency' ? 'currencies' : 'items'} defined yet
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  {/* Quantity Input */}
                  <Input
                    type="number"
                    min={1}
                    value={item.amount}
                    onChange={(e) => handleChange(index, 'amount', parseInt(e.target.value) || 1)}
                    className="w-[80px] h-9"
                  />

                  {/* Probability Input (as percentage) */}
                  <div className="flex items-center gap-1 w-[100px]">
                    <Input
                      type="number"
                      step="1"
                      min={0}
                      max={100}
                      value={Math.round(item.probability * 100)}
                      onChange={(e) => handleChange(index, 'probability', (parseInt(e.target.value) || 0) / 100)}
                      className="w-[60px] h-9"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>

                  {/* Upgrade Multiplier Input */}
                  <div className="flex items-center gap-1 w-[100px]">
                    <Input
                      type="number"
                      step="0.5"
                      min={1}
                      value={item.upgrade_multiplier}
                      onChange={(e) => handleChange(index, 'upgrade_multiplier', parseFloat(e.target.value) || 1)}
                      className="w-[60px] h-9"
                    />
                    <span className="text-xs text-muted-foreground">×</span>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    disabled={items.length <= minItems}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Total probability indicator */}
        {items.length > 0 && (
          <div className="flex items-center justify-end gap-2 text-xs">
            <span className="text-muted-foreground">Total Chance:</span>
            <span className={cn(
              "font-medium",
              Math.abs(items.reduce((sum, item) => sum + item.probability, 0) - 1) < 0.01
                ? "text-green-500"
                : "text-amber-500"
            )}>
              {Math.round(items.reduce((sum, item) => sum + item.probability, 0) * 100)}%
            </span>
            {Math.abs(items.reduce((sum, item) => sum + item.probability, 0) - 1) >= 0.01 && (
              <span className="text-amber-500">(should be 100%)</span>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
