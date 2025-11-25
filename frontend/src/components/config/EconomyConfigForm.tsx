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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Plus, Trash2, Edit } from 'lucide-react';
import { economyConfigSchema, type EconomyConfig } from '@/lib/validations/economyConfig';
import { useState } from 'react';

interface EconomyConfigFormProps {
  initialData?: EconomyConfig;
  onSubmit: (data: EconomyConfig) => void;
  onCancel?: () => void;
}

export function EconomyConfigForm({ initialData, onSubmit, onCancel }: EconomyConfigFormProps) {
  const [editingCurrencyIndex, setEditingCurrencyIndex] = useState<number | null>(null);

  const form = useForm<EconomyConfig>({
    resolver: zodResolver(economyConfigSchema),
    defaultValues: initialData || {
      currencies: [],
      iap_packages: [],
      daily_rewards: [],
    },
  });

  const {
    fields: currencyFields,
    append: appendCurrency,
    remove: removeCurrency,
    update: updateCurrency,
  } = useFieldArray({
    control: form.control,
    name: 'currencies',
  });

  const {
    fields: iapFields,
    append: appendIAP,
    remove: removeIAP,
  } = useFieldArray({
    control: form.control,
    name: 'iap_packages',
  });

  // Daily rewards section - not yet implemented
  // const {
  //   fields: dailyRewardFields,
  //   append: appendDailyReward,
  //   remove: removeDailyReward,
  // } = useFieldArray({
  //   control: form.control,
  //   name: 'daily_rewards',
  // });

  const handleAddCurrency = () => {
    appendCurrency({
      id: '',
      name: '',
      type: 'soft',
      starting_amount: 0,
      icon_url: '',
    });
    setEditingCurrencyIndex(currencyFields.length);
  };

  const handleSaveCurrency = (index: number) => {
    const currency = form.getValues(`currencies.${index}`);
    if (currency.id && currency.name) {
      updateCurrency(index, currency);
      setEditingCurrencyIndex(null);
    }
  };

  const handleAddIAP = () => {
    appendIAP({
      id: '',
      product_id: '',
      price: 0,
      currency: 'USD',
      rewards: [],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Currencies Section */}
        <Card className="border-border/30 shadow-stripe-sm transition-all hover:shadow-stripe-md">
          <CardHeader className="pb-5">
            <CardTitle className="text-lg font-semibold tracking-tight">Currencies</CardTitle>
            <CardDescription className="text-sm mt-1.5">Define game currencies (soft, hard, premium)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currencyFields.map((field, index) => (
              <div key={field.id} className="nested-card space-y-4 shadow-stripe-xs hover:shadow-stripe-sm" data-testid="currency-item">
                {editingCurrencyIndex === index ? (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="coins" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Coins" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="soft">Soft Currency</SelectItem>
                              <SelectItem value="hard">Hard Currency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`currencies.${index}.starting_amount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Starting Amount *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => handleSaveCurrency(index)}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingCurrencyIndex(null);
                          removeCurrency(index);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{form.watch(`currencies.${index}.name`)}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {form.watch(`currencies.${index}.id`)} | Type:{' '}
                        {form.watch(`currencies.${index}.type`)} | Starting:{' '}
                        {form.watch(`currencies.${index}.starting_amount`)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCurrencyIndex(index)}
                        aria-label="Edit currency"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCurrency(index)}
                        aria-label="Delete currency"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddCurrency} className="shadow-stripe-xs transition-all hover:shadow-stripe-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Currency
            </Button>
            {form.formState.errors.currencies && (
              <p className="text-sm text-destructive">{form.formState.errors.currencies.message}</p>
            )}
          </CardContent>
        </Card>

        {/* IAP Packages Section */}
        <Card className="border-border/30 shadow-stripe-sm transition-all hover:shadow-stripe-md">
          <CardHeader className="pb-5">
            <CardTitle className="text-lg font-semibold tracking-tight">IAP Packages</CardTitle>
            <CardDescription className="text-sm mt-1.5">In-App Purchase packages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {iapFields.map((field, index) => (
              <div key={field.id} className="nested-card space-y-4 shadow-stripe-xs hover:shadow-stripe-sm">
                <FormField
                  control={form.control}
                  name={`iap_packages.${index}.id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package ID</FormLabel>
                      <FormControl>
                        <Input placeholder="starter_pack" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`iap_packages.${index}.product_id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product ID</FormLabel>
                      <FormControl>
                        <Input placeholder="com.sunstudio.game.starter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`iap_packages.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  onClick={() => removeIAP(index)}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddIAP} className="shadow-stripe-xs transition-all hover:shadow-stripe-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add IAP Package
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-6 border-t border-border/30">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="h-9 px-4 shadow-stripe-xs transition-all hover:shadow-stripe-sm">
              Cancel
            </Button>
          )}
          <Button type="submit" className="h-9 px-6 shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5">Save Economy Config</Button>
        </div>
      </form>
    </Form>
  );
}

