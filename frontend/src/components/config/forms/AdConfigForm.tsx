'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/Form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/Button';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { Plus, Trash2 } from 'lucide-react';
import {
    adConfigSchema,
    type AdConfig,
    type AdNetwork,
    type AdPlacement,
} from '@/lib/validations/adConfig';

const DEFAULT_CONFIG: AdConfig = {
    networks: [],
    interstitial: {
        enabled: true,
        frequency_cap: {
            count: 1,
            period_minutes: 5,
        },
        reward: {},
    },
    rewarded: {
        enabled: true,
        frequency_cap: {
            count: 3,
            period_minutes: 60,
        },
        reward: {},
    },
    banner: {
        enabled: true,
        frequency_cap: {
            count: 1,
            period_minutes: 1,
        },
        reward: {},
    },
    remove_ads_product_id: '',
};

const mergePlacement = (
    placement: AdPlacement | undefined,
    defaults: AdPlacement,
): AdPlacement => ({
    enabled: placement?.enabled ?? defaults.enabled,
    frequency_cap: {
        count: placement?.frequency_cap?.count ?? defaults.frequency_cap.count,
        period_minutes:
            placement?.frequency_cap?.period_minutes ??
            defaults.frequency_cap.period_minutes,
    },
    reward: placement?.reward ?? defaults.reward,
});

interface AdConfigFormProps {
    initialData?: AdConfig;
    onSubmit: (data: AdConfig) => void;
    onCancel?: () => void;
    isSaving?: boolean;
}

export function AdConfigForm({
    initialData,
    onSubmit,
    onCancel,
    isSaving = false,
}: AdConfigFormProps) {
    const mergedDefaults: AdConfig = {
        ...DEFAULT_CONFIG,
        ...(initialData ?? {}),
        networks: (initialData?.networks ?? DEFAULT_CONFIG.networks).map(
            (network, index) => ({
                id: network.id,
                app_id: network.app_id,
                priority: network.priority ?? index + 1,
                enabled: network.enabled ?? true,
            }),
        ),
        interstitial: mergePlacement(initialData?.interstitial, DEFAULT_CONFIG.interstitial),
        rewarded: mergePlacement(initialData?.rewarded, DEFAULT_CONFIG.rewarded),
        banner: mergePlacement(initialData?.banner, DEFAULT_CONFIG.banner),
        remove_ads_product_id:
            initialData?.remove_ads_product_id ?? DEFAULT_CONFIG.remove_ads_product_id,
    };

    const form = useForm<AdConfig>({
        resolver: zodResolver(adConfigSchema),
        defaultValues: mergedDefaults,
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'networks',
    });

    const isValid = form.formState.isValid;
    const handleSubmit = form.handleSubmit(onSubmit);

    const handleAddNetwork = () => {
        const newNetwork: AdNetwork = {
            id: '',
            enabled: true,
            app_id: '',
            priority: fields.length + 1,
        };
        append(newNetwork);
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Ad Networks Section */}
                <ConfigFormSection
                    title="Ad Networks"
                    description="Configure ad network providers and their priorities"
                    defaultOpen={true}
                    headerActions={
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddNetwork}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Network
                        </Button>
                    }
                >
                    <div className="space-y-4">
                        {fields.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No ad networks configured. Click "Add Network" to get started.
                            </div>
                        ) : (
                            fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="p-4 border border-border/50 rounded-lg space-y-4 bg-muted/20"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-semibold">
                                            Network {index + 1}
                                        </h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(index)}
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name={`networks.${index}.id`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Network ID</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g., admob, unity"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Unique identifier for the ad network
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`networks.${index}.app_id`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>App ID</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Network-specific app ID"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        App ID from the ad network provider
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`networks.${index}.priority`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Priority</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseInt(e.target.value) || 1)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Lower number = higher priority
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`networks.${index}.enabled`}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-sm">Enabled</FormLabel>
                                                        <FormDescription className="text-xs">
                                                            Activate this network
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
                            ))
                        )}
                    </div>
                </ConfigFormSection>

                {/* Interstitial Ads Section */}
                <ConfigFormSection
                    title="Interstitial Ads"
                    description="Configure interstitial ad placement settings"
                    defaultOpen={true}
                >
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="interstitial.enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Enable Interstitial Ads
                                        </FormLabel>
                                        <FormDescription>
                                            Show interstitial ads in the game
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="interstitial.frequency_cap.count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequency Cap Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value) || 1)
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Maximum number of shows per period
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="interstitial.frequency_cap.period_minutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Period (Minutes)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value) || 1)
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Time period for frequency cap
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </ConfigFormSection>

                {/* Rewarded Ads Section */}
                <ConfigFormSection
                    title="Rewarded Ads"
                    description="Configure rewarded ad placement settings"
                    defaultOpen={true}
                >
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="rewarded.enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Enable Rewarded Ads
                                        </FormLabel>
                                        <FormDescription>
                                            Show rewarded ads in the game
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="rewarded.frequency_cap.count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequency Cap Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value) || 1)
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Maximum number of shows per period
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rewarded.frequency_cap.period_minutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Period (Minutes)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value) || 1)
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Time period for frequency cap
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </ConfigFormSection>

                {/* Banner Ads Section */}
                <ConfigFormSection
                    title="Banner Ads"
                    description="Configure banner ad placement settings"
                    defaultOpen={true}
                >
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="banner.enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Enable Banner Ads</FormLabel>
                                        <FormDescription>
                                            Show banner ads in the game
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="banner.frequency_cap.count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequency Cap Count</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value) || 1)
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Maximum number of shows per period
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="banner.frequency_cap.period_minutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Period (Minutes)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(parseInt(e.target.value) || 1)
                                                }
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Time period for frequency cap
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </ConfigFormSection>

                {/* Remove Ads Configuration */}
                <ConfigFormSection
                    title="Remove Ads"
                    description="Configure the remove ads IAP product"
                    defaultOpen={true}
                    collapsible={false}
                >
                    <FormField
                        control={form.control}
                        name="remove_ads_product_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Remove Ads Product ID</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., com.sunstudio.game.removeads"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    IAP product ID for removing ads (optional)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </ConfigFormSection>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={!isValid || isSaving}
                        className="shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
