'use client';

import * as React from 'react';
import { Plus, Trash2, Coins, Package, Gift } from 'lucide-react';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Bonus, Currency, InventoryItem } from '@/lib/validations/economyConfig';

interface BonusEditorProps {
  title?: string;
  description?: string;
  items: Bonus[];
  onChange: (items: Bonus[]) => void;
  currencies: Currency[];
  inventoryItems: InventoryItem[];
  className?: string;
}

export function BonusEditor({
  title = 'Bonuses (Conditional rewards)',
  description = 'Bonuses are granted during purchases but NOT during restore operations.',
  items,
  onChange,
  currencies,
  inventoryItems,
  className,
}: BonusEditorProps) {
  const [isOpen, setIsOpen] = React.useState(items.length > 0);

  const handleAdd = () => {
    onChange([
      ...items,
      { 
        type: 'Currency', 
        resourceId: '', 
        amount: 1,
        condition: '',
      },
    ]);
    setIsOpen(true);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (index: number, field: keyof Bonus, value: any) => {
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 text-left text-foreground hover:text-primary transition-colors"
          >
            <Gift className="h-4 w-4 text-muted-foreground" />
            <div>
              <Label className="text-sm font-medium cursor-pointer">{title}</Label>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-8 px-3"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Bonus
        </Button>
      </div>

      <CollapsibleContent className="animate-slide-up">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 p-4 text-center">
            <p className="text-xs text-muted-foreground">No bonuses configured</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-border bg-muted/10 space-y-3"
              >
                <div className="flex items-center gap-2">
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

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Condition (optional) */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-[120px]">Condition:</Label>
                  <Input
                    value={item.condition || ''}
                    onChange={(e) => handleChange(index, 'condition', e.target.value)}
                    className="flex-1 h-8 text-sm"
                    placeholder="e.g., first_purchase, vip_member (optional)"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

