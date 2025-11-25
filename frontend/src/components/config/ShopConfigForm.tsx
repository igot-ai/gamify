import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/Textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import {
  shopConfigSchema,
  type ShopConfig,
} from '@/lib/validations/shopConfig';
import { useState, useMemo } from 'react';
import { useConfig } from '@/hooks/useConfigs';

interface ShopConfigFormProps {
  initialData?: ShopConfig;
  onSubmit: (data: ShopConfig) => void;
  onCancel?: () => void;
  configId?: string; // To fetch economy config for currency references
}

export function ShopConfigForm({
  initialData,
  onSubmit,
  onCancel,
  configId,
}: ShopConfigFormProps) {
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<{
    categoryIndex: number;
    itemIndex: number;
  } | null>(null);

  // Fetch economy config to get available currencies for price/reward references
  const { data: config } = useConfig(configId || '');
  const availableCurrencies = useMemo(() => {
    // Access economy config - it may be in different formats
    const economy = config?.data?.economy as any;
    if (economy?.currencies && Array.isArray(economy.currencies)) {
      return economy.currencies.map((c: any) => ({
        id: c.id,
        name: c.name,
      }));
    }
    return [];
  }, [config]);

  const form = useForm({
    resolver: zodResolver(shopConfigSchema),
    defaultValues: initialData || {
      categories: [],
      featured_items: [],
      rotation_enabled: false,
    },
  });

  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control: form.control,
    name: 'categories',
  });

  const featuredItems = form.watch('featured_items') || [];
  const allItemIds = useMemo(() => {
    const ids: string[] = [];
    const categories = form.watch('categories') || [];
    categories.forEach((category) => {
      if (category?.items) {
        category.items.forEach((item) => {
          if (item?.id) {
            ids.push(item.id);
          }
        });
      }
    });
    return ids;
  }, [form.watch('categories')]);

  const handleAddCategory = () => {
    appendCategory({
      id: '',
      name: '',
      icon_url: '',
      items: [],
    });
    setEditingCategoryIndex(categoryFields.length);
  };

  const handleSaveCategory = (index: number) => {
    const category = form.getValues(`categories.${index}`);
    if (category?.id && category?.name) {
      setEditingCategoryIndex(null);
    }
  };

  const handleAddItem = (categoryIndex: number) => {
    const categoryItems = form.getValues(`categories.${categoryIndex}.items`) || [];
    form.setValue(`categories.${categoryIndex}.items`, [
      ...categoryItems,
      {
        id: '',
        name: '',
        description: '',
        icon_url: '',
        price: { currency_id: '', amount: 0 },
        rewards: [],
        limited_time: false,
        expires_at: '',
        purchase_limit: undefined,
      },
    ]);
    setEditingItemIndex({ categoryIndex, itemIndex: categoryItems.length });
  };

  const handleRemoveItem = (categoryIndex: number, itemIndex: number) => {
    const items = form.getValues(`categories.${categoryIndex}.items`) || [];
    const itemId = items[itemIndex]?.id;
    
    // Remove from featured items if it was featured
    if (itemId && featuredItems.includes(itemId)) {
      form.setValue(
        'featured_items',
        featuredItems.filter((id) => id !== itemId)
      );
    }
    
    items.splice(itemIndex, 1);
    form.setValue(`categories.${categoryIndex}.items`, items);
    setEditingItemIndex(null);
  };

  const handleToggleFeaturedItem = (itemId: string) => {
    const currentFeatured = form.getValues('featured_items') || [];
    if (currentFeatured.includes(itemId)) {
      form.setValue(
        'featured_items',
        currentFeatured.filter((id) => id !== itemId)
      );
    } else {
      form.setValue('featured_items', [...currentFeatured, itemId]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Shop Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Shop Settings</CardTitle>
            <CardDescription>
              Configure global shop behavior and featured items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="rotation_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Rotation Enabled</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable automatic rotation of shop items
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Featured Items</FormLabel>
              <div className="text-sm text-muted-foreground mb-4">
                Select items to feature prominently in the shop
              </div>
              {allItemIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add items to categories first to feature them
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {allItemIds.map((itemId) => {
                      const categories = form.watch('categories') || [];
                      const category = categories.find((cat) => cat?.items?.some((item) => item?.id === itemId));
                      const item = category?.items?.find((item) => item?.id === itemId);
                      const isFeatured = (featuredItems || []).includes(itemId);

                      return (
                        <div
                          key={itemId}
                          className={`flex items-center gap-2 rounded-md border px-3 py-1 ${
                            isFeatured ? 'bg-primary/10 border-primary' : 'bg-muted'
                          }`}
                        >
                          <span className="text-sm">{item?.name || itemId}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleFeaturedItem(itemId)}
                            className="text-xs"
                          >
                            {isFeatured ? (
                              <X className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {form.formState.errors.featured_items && (
                    <FormMessage>
                      {form.formState.errors.featured_items.message}
                    </FormMessage>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shop Categories Section */}
        <Card>
          <CardHeader>
            <CardTitle>Shop Categories</CardTitle>
            <CardDescription>
              Organize shop items into categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {categoryFields.map((categoryField, categoryIndex) => {
              const category = form.watch(`categories.${categoryIndex}`);
              const isEditingCategory = editingCategoryIndex === categoryIndex;
              const items = category?.items || [];

              return (
                <div
                  key={categoryField.id}
                  className="border rounded-lg p-4 space-y-4"
                  data-testid="category-item"
                >
                  {isEditingCategory ? (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`categories.${categoryIndex}.id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category ID *</FormLabel>
                            <FormControl>
                              <Input placeholder="gems_currency" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`categories.${categoryIndex}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Gems & Currency" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`categories.${categoryIndex}.icon_url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/icon.png"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Items in Category */}
                      <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <FormLabel>Items in Category ({items.length})</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddItem(categoryIndex)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                          </Button>
                        </div>

                        {items.map((item, itemIndex) => {
                          const isEditingItem =
                            editingItemIndex?.categoryIndex === categoryIndex &&
                            editingItemIndex?.itemIndex === itemIndex;

                          return (
                            <div
                              key={itemIndex}
                              className="border rounded p-4 space-y-4 bg-muted/50"
                            >
                              {isEditingItem ? (
                                <ShopItemEditor
                                  categoryIndex={categoryIndex}
                                  itemIndex={itemIndex}
                                  form={form}
                                  availableCurrencies={availableCurrencies}
                                  onSave={() => setEditingItemIndex(null)}
                                  onCancel={() => setEditingItemIndex(null)}
                                  onRemove={() => handleRemoveItem(categoryIndex, itemIndex)}
                                />
                              ) : (
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{item.name || 'Unnamed Item'}</p>
                                    <p className="text-sm text-muted-foreground">
                                      ID: {item.id} | Price: {item.price?.amount}{' '}
                                      {item.price?.currency_id} | Rewards: {item.rewards?.length}
                                      {item.limited_time && ' | Limited Time'}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setEditingItemIndex({ categoryIndex, itemIndex })
                                      }
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveItem(categoryIndex, itemIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => handleSaveCategory(categoryIndex)}
                        >
                          Save Category
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingCategoryIndex(null);
                            removeCategory(categoryIndex);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{category?.name || 'Unnamed Category'}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {category?.id || 'N/A'} | Items: {items?.length || 0}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategoryIndex(categoryIndex)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(categoryIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Button type="button" variant="outline" onClick={handleAddCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            {form.formState.errors.categories && (
              <p className="text-sm text-destructive">
                {form.formState.errors.categories.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Save Shop Config</Button>
        </div>
      </form>
    </Form>
  );
}

// Shop Item Editor Component (extracted for reusability)
interface ShopItemEditorProps {
  categoryIndex: number;
  itemIndex: number;
  form: any;
  availableCurrencies: Array<{ id: string; name: string }>;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
}

function ShopItemEditor({
  categoryIndex,
  itemIndex,
  form,
  availableCurrencies,
  onSave,
  onCancel,
  onRemove,
}: ShopItemEditorProps) {
  const rewards = form.watch(`categories.${categoryIndex}.items.${itemIndex}.rewards`) || [];
  const limitedTime = form.watch(`categories.${categoryIndex}.items.${itemIndex}.limited_time`);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`categories.${categoryIndex}.items.${itemIndex}.id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item ID *</FormLabel>
            <FormControl>
              <Input placeholder="50_gems" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`categories.${categoryIndex}.items.${itemIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Item Name *</FormLabel>
            <FormControl>
              <Input placeholder="50 Gems" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`categories.${categoryIndex}.items.${itemIndex}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <Textarea placeholder="Get 50 premium gems" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`categories.${categoryIndex}.items.${itemIndex}.icon_url`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icon URL</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com/icon.png" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`categories.${categoryIndex}.items.${itemIndex}.price.currency_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Currency/Product ID *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency or IAP" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableCurrencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.name} ({currency.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`categories.${categoryIndex}.items.${itemIndex}.price.amount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Amount *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="4.99"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Rewards */}
      <div className="space-y-2">
        <FormLabel>Rewards *</FormLabel>
        {rewards.map((_reward: any, rewardIndex: number) => (
          <div key={rewardIndex} className="flex gap-2 items-end">
            <FormField
              control={form.control}
              name={`categories.${categoryIndex}.items.${itemIndex}.rewards.${rewardIndex}.currency_id`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCurrencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`categories.${categoryIndex}.items.${itemIndex}.rewards.${rewardIndex}.amount`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Amount"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentRewards = form.getValues(
                  `categories.${categoryIndex}.items.${itemIndex}.rewards`
                );
                currentRewards.splice(rewardIndex, 1);
                form.setValue(
                  `categories.${categoryIndex}.items.${itemIndex}.rewards`,
                  currentRewards
                );
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const currentRewards = form.getValues(
              `categories.${categoryIndex}.items.${itemIndex}.rewards`
            );
            form.setValue(`categories.${categoryIndex}.items.${itemIndex}.rewards`, [
              ...(currentRewards || []),
              { currency_id: '', amount: 0 },
            ]);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Reward
        </Button>
      </div>

      {/* Limited Time Options */}
      <FormField
        control={form.control}
        name={`categories.${categoryIndex}.items.${itemIndex}.limited_time`}
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Limited Time Offer</FormLabel>
              <div className="text-sm text-muted-foreground">
                Enable time-limited availability
              </div>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {limitedTime && (
        <>
          <FormField
            control={form.control}
            name={`categories.${categoryIndex}.items.${itemIndex}.expires_at`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires At *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).toISOString() : '';
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`categories.${categoryIndex}.items.${itemIndex}.purchase_limit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Limit *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      <div className="flex gap-2">
        <Button type="button" onClick={onSave}>
          Save Item
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={onRemove}>
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}

