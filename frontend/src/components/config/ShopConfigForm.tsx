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
    const economy = config?.economy_config as any;
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Shop Settings Section */}
        <Card className="border-border/30 shadow-stripe-sm transition-all hover:shadow-stripe-md">
          <CardHeader className="pb-5">
            <CardTitle className="text-lg font-semibold tracking-tight">Shop Settings</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1.5">
              Configure global shop behavior and featured items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <FormField
              control={form.control}
              name="rotation_enabled"
              render={({ field }) => (
                <FormItem className="switch-container">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <FormLabel className="text-sm font-medium">Rotation Enabled</FormLabel>
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

            <div className="space-y-3">
              <div>
                <FormLabel className="text-sm font-medium">Featured Items</FormLabel>
                <div className="text-sm text-muted-foreground mt-1">
                  Select items to feature prominently in the shop
                </div>
              </div>
              {allItemIds.length === 0 ? (
                <div className="empty-state">
                  <p className="text-sm text-muted-foreground">
                    Add items to categories first to feature them
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {allItemIds.map((itemId) => {
                      const categories = form.watch('categories') || [];
                      const category = categories.find((cat) => cat?.items?.some((item) => item?.id === itemId));
                      const item = category?.items?.find((item) => item?.id === itemId);
                      const isFeatured = (featuredItems || []).includes(itemId);

                      return (
                        <button
                          key={itemId}
                          type="button"
                          onClick={() => handleToggleFeaturedItem(itemId)}
                          className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-stripe-xs transition-all hover:shadow-stripe-sm ${isFeatured
                              ? 'bg-primary/10 border-primary/40 text-primary hover:bg-primary/15 hover:border-primary/60'
                              : 'bg-muted/20 border-border/30 text-foreground hover:bg-muted/40 hover:border-border/50'
                            }`}
                        >
                          <span>{item?.name || itemId}</span>
                          {isFeatured ? (
                            <X className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.featured_items && (
                    <FormMessage className="text-xs">
                      {form.formState.errors.featured_items.message}
                    </FormMessage>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shop Categories Section */}
        <Card className="border-border/30 shadow-stripe-sm transition-all hover:shadow-stripe-md">
          <CardHeader className="pb-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">Shop Categories</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1.5">
                  Organize shop items into categories
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCategory}
                className="h-9 px-4 shadow-stripe-xs transition-all hover:shadow-stripe-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {categoryFields.map((categoryField, categoryIndex) => {
              const category = form.watch(`categories.${categoryIndex}`);
              const isEditingCategory = editingCategoryIndex === categoryIndex;
              const items = category?.items || [];

              return (
                <div
                  key={categoryField.id}
                  className="nested-card space-y-5 shadow-stripe-xs hover:shadow-stripe-sm"
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
                      <div className="space-y-4 border-t border-border/30 pt-5">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm font-medium">
                            Items in Category
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              ({items.length})
                            </span>
                          </FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddItem(categoryIndex)}
                            className="h-8 px-3"
                          >
                            <Plus className="mr-2 h-3.5 w-3.5" />
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
                              className="border border-border/25 rounded-lg p-4 space-y-4 bg-muted/15 shadow-stripe-xs transition-all hover:bg-muted/25 hover:shadow-stripe-sm"
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
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{item.name || 'Unnamed Item'}</p>
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                      ID: {item.id} • Price: {item.price?.amount} {item.price?.currency_id} • Rewards: {item.rewards?.length}
                                      {item.limited_time && ' • Limited Time'}
                                    </p>
                                  </div>
                                  <div className="flex gap-1.5 ml-4">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setEditingItemIndex({ categoryIndex, itemIndex })
                                      }
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveItem(categoryIndex, itemIndex)}
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{category?.name || 'Unnamed Category'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {category?.id || 'N/A'} • Items: {items?.length || 0}
                        </p>
                      </div>
                      <div className="flex gap-1.5 ml-4">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategoryIndex(categoryIndex)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(categoryIndex)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {categoryFields.length === 0 && (
              <div className="empty-state">
                <p className="text-sm text-muted-foreground mb-1">No categories yet</p>
                <p className="text-xs text-muted-foreground/70">Add your first category to get started</p>
              </div>
            )}

            {form.formState.errors.categories && (
              <p className="text-sm text-destructive">
                {form.formState.errors.categories.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t border-border/30">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="h-9 px-4 shadow-stripe-xs transition-all hover:shadow-stripe-sm">
              Cancel
            </Button>
          )}
          <Button type="submit" className="h-9 px-6 shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5">
            Save Shop Config
          </Button>
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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name={`categories.${categoryIndex}.items.${itemIndex}.id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Item ID *</FormLabel>
              <FormControl>
                <Input placeholder="50_gems" {...field} className="h-9" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`categories.${categoryIndex}.items.${itemIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Item Name *</FormLabel>
              <FormControl>
                <Input placeholder="50 Gems" {...field} className="h-9" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`categories.${categoryIndex}.items.${itemIndex}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Get 50 premium gems"
                {...field}
                className="min-h-[80px] resize-none"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`categories.${categoryIndex}.items.${itemIndex}.icon_url`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Icon URL</FormLabel>
            <FormControl>
              <Input
                placeholder="https://example.com/icon.png"
                {...field}
                value={field.value || ''}
                className="h-9"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name={`categories.${categoryIndex}.items.${itemIndex}.price.currency_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Price Currency/Product ID *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9">
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
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`categories.${categoryIndex}.items.${itemIndex}.price.amount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Price Amount *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="4.99"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="h-9"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      {/* Rewards */}
      <div className="space-y-3">
        <div>
          <FormLabel className="text-sm font-medium">Rewards *</FormLabel>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure what players receive when purchasing this item
          </p>
        </div>
        <div className="space-y-3">
          {rewards.map((_reward: any, rewardIndex: number) => (
            <div key={rewardIndex} className="flex gap-3 items-end p-3 rounded-lg border border-border/30 bg-muted/10">
              <FormField
                control={form.control}
                name={`categories.${categoryIndex}.items.${itemIndex}.rewards.${rewardIndex}.currency_id`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select currency" />
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
                    <FormMessage className="text-xs" />
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
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
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
                className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
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
          className="h-9 px-4"
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Reward
        </Button>
      </div>

      {/* Limited Time Options */}
      <FormField
        control={form.control}
        name={`categories.${categoryIndex}.items.${itemIndex}.limited_time`}
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-5 transition-colors hover:bg-muted/30">
            <div className="space-y-0.5 flex-1 pr-4">
              <FormLabel className="text-sm font-medium">Limited Time Offer</FormLabel>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-lg border border-border/30 bg-muted/10">
          <FormField
            control={form.control}
            name={`categories.${categoryIndex}.items.${itemIndex}.expires_at`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Expires At *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).toISOString() : '';
                      field.onChange(date);
                    }}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`categories.${categoryIndex}.items.${itemIndex}.purchase_limit`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Purchase Limit *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    value={field.value || ''}
                    className="h-9"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-border/30">
        <Button type="button" onClick={onSave} className="h-9 px-4">
          Save Item
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-9 px-4">
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={onRemove} className="h-9 px-4">
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Remove
        </Button>
      </div>
    </div>
  );
}

