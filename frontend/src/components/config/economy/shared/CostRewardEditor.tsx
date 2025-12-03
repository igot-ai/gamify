'use client';

import * as React from 'react';
import { Plus, Trash2, Coins, Package } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { ResourceReference, Currency, InventoryItem } from '@/lib/validations/economyConfig';

interface CostRewardEditorProps {
  title: string;
  description?: string;
  items: ResourceReference[];
  onChange: (items: ResourceReference[]) => void;
  currencies: Currency[];
  inventoryItems: InventoryItem[];
  className?: string;
  minItems?: number;
  addButtonText?: string;
}

export function CostRewardEditor({
  title,
  description,
  items,
  onChange,
  currencies,
  inventoryItems,
  className,
  minItems = 0,
  addButtonText = 'Add',
}: CostRewardEditorProps) {
  const handleAdd = () => {
    onChange([
      ...items,
      { type: 'Currency', resourceId: '', amount: 1 },
    ]);
  };

  const handleRemove = (index: number) => {
    if (items.length <= minItems) return;
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (index: number, field: keyof ResourceReference, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Reset resourceId when type changes
    if (field === 'type') {
      newItems[index].resourceId = '';
    }
    
    onChange(newItems);
  };

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

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 p-4 text-center">
          <p className="text-xs text-muted-foreground">No items added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/10 transition-colors hover:bg-muted/20"
            >
              {/* Type Selector */}
              <Select
                value={item.type}
                onValueChange={(value) => handleChange(index, 'type', value)}
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
                value={item.resourceId}
                onValueChange={(value) => handleChange(index, 'resourceId', value)}
              >
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue placeholder="Select resource..." />
                </SelectTrigger>
                <SelectContent>
                  {getResourceOptions(item.type).map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label} ({option.id})
                    </SelectItem>
                  ))}
                  {getResourceOptions(item.type).length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      No {item.type === 'Currency' ? 'currencies' : 'items'} defined yet
                    </div>
                  )}
                </SelectContent>
              </Select>

              {/* Amount Input */}
              <Input
                type="number"
                min={1}
                value={item.amount}
                onChange={(e) => handleChange(index, 'amount', parseInt(e.target.value) || 1)}
                className="w-[100px] h-9"
                placeholder="Amount"
              />

              {/* Info Badge */}
              <div className="text-xs text-muted-foreground min-w-[80px]">
                {item.type === 'Currency' ? 'Currency' : 'Item'}
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
          ))}
        </div>
      )}
    </div>
  );
}

