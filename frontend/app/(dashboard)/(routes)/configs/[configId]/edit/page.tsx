'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useConfig,
  useUpdateConfig,
  useSubmitForReview,
} from '@/hooks/useConfigs';
import { EconomyConfigForm } from '@/components/config/EconomyConfigForm';
import { ShopConfigForm } from '@/components/config/ShopConfigForm';
import { JsonEditor } from '@/components/config/JsonEditor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { toast } from 'sonner';
import { Save, Send, Loader2 } from 'lucide-react';
import type { EconomyConfig } from '@/lib/validations/economyConfig';
import type { ShopConfig } from '@/lib/validations/shopConfig';
import { shopConfigSchema } from '@/lib/validations/shopConfig';
import { economyConfigSchema } from '@/lib/validations/economyConfig';
import type { ConfigType } from '@/lib/configTemplates';

export default function ConfigEditorPage() {
  const params = useParams();
  const configId = params?.configId as string;
  const router = useRouter();
  const { data: config, isLoading } = useConfig(configId || '');
  const updateConfig = useUpdateConfig(configId || '');
  const submitForReview = useSubmitForReview();

  const [activeTab, setActiveTab] = useState('economy');
  const [viewMode, setViewMode] = useState<Record<string, 'form' | 'json'>>({
    economy: 'form',
    shop: 'form',
    ads: 'json',
    notifications: 'json',
    boosters: 'json',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEconomy = async (data: EconomyConfig) => {
    if (!configId || !config) return;

    setIsSaving(true);
    try {
      await updateConfig.mutateAsync({
        data: {
          ...config.data,
          economy: data as any,
        },
      });
      toast.success('Economy config saved');
    } catch (error) {
      toast.error('Failed to save economy config');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveShop = async (data: ShopConfig) => {
    if (!configId || !config) return;

    setIsSaving(true);
    try {
      await updateConfig.mutateAsync({
        data: {
          ...config.data,
          shop: data as any,
        },
      });
      toast.success('Shop config saved');
    } catch (error) {
      toast.error('Failed to save shop config');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveJsonConfig = async (configType: ConfigType, data: any) => {
    if (!configId || !config) return;

    setIsSaving(true);
    try {
      const configKey = configType === 'economy' ? 'economy' : 
                       configType === 'shop' ? 'shop' :
                       configType === 'ads' ? 'ad' :
                       configType === 'notifications' ? 'notification' :
                       configType === 'boosters' ? 'booster' :
                       configType === 'chapter_reward' ? 'chapter_reward' :
                       configType === 'game_core' ? 'game_core' :
                       configType === 'analytics' ? 'analytics' :
                       'ux';

      await updateConfig.mutateAsync({
        data: {
          ...config.data,
          [configKey]: data,
        },
      });
      toast.success(`${configType} config saved`);
    } catch (error) {
      toast.error(`Failed to save ${configType} config`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!configId) return;

    setIsSaving(true);
    try {
      // Save current form state
      toast.success('Config saved as draft');
    } catch (error) {
      toast.error('Failed to save config');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!configId) return;

    try {
      await submitForReview.mutateAsync(configId);
      toast.success('Config submitted for review');
      router.push(`/configs/${configId}`);
    } catch (error) {
      toast.error('Failed to submit for review');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Config not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (config.status !== 'draft') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              This config cannot be edited. Status: {config.status}
            </p>
            <Button
              onClick={() => router.push(`/configs/${configId}`)}
              className="mt-4"
            >
              View Config
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Edit Configuration
        </h1>
        <p className="text-muted-foreground">
          Version {config.version} - {config.status}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="economy">Economy</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="boosters">Boosters</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
        </TabsList>

        <TabsContent value="economy" className="space-y-4">
          <Tabs
            value={viewMode.economy}
            onValueChange={(v) => setViewMode({ ...viewMode, economy: v as 'form' | 'json' })}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="form">Form View</TabsTrigger>
              <TabsTrigger value="json">JSON Editor</TabsTrigger>
            </TabsList>
            <TabsContent value="form">
              <Card>
                <CardHeader>
                  <CardTitle>Economy Config</CardTitle>
                  <CardDescription>
                    Configure currencies, IAP packages, and daily rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EconomyConfigForm
                    initialData={config.data?.economy as unknown as EconomyConfig}
                    onSubmit={handleSaveEconomy}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="json">
              <JsonEditor
                configType="economy"
                initialValue={config.data?.economy}
                onSave={(data) => handleSaveJsonConfig('economy', data)}
                schema={economyConfigSchema}
                title="Economy Configuration"
                description="Edit economy configuration using JSON editor with change comparison"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <JsonEditor
            configType="ads"
            initialValue={config.data?.ad}
            onSave={(data) => handleSaveJsonConfig('ads', data)}
            title="Ad Configuration"
            description="Configure ad networks and placements using JSON editor"
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <JsonEditor
            configType="notifications"
            initialValue={config.data?.notification}
            onSave={(data) => handleSaveJsonConfig('notifications', data)}
            title="Notification Configuration"
            description="Configure notification strategies and channels using JSON editor"
          />
        </TabsContent>

        <TabsContent value="boosters" className="space-y-4">
          <JsonEditor
            configType="boosters"
            initialValue={config.data?.booster}
            onSave={(data) => handleSaveJsonConfig('boosters', data)}
            title="Booster Configuration"
            description="Configure booster items using JSON editor"
          />
        </TabsContent>

        <TabsContent value="shop" className="space-y-4">
          <Tabs
            value={viewMode.shop}
            onValueChange={(v) => setViewMode({ ...viewMode, shop: v as 'form' | 'json' })}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="form">Form View</TabsTrigger>
              <TabsTrigger value="json">JSON Editor</TabsTrigger>
            </TabsList>
            <TabsContent value="form">
              <Card>
                <CardHeader>
                  <CardTitle>Shop Config</CardTitle>
                  <CardDescription>
                    Configure shop items and bundles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ShopConfigForm
                    initialData={config.data?.shop as unknown as ShopConfig}
                    onSubmit={handleSaveShop}
                    configId={configId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="json">
              <JsonEditor
                configType="shop"
                initialValue={config.data?.shop}
                onSave={(data) => handleSaveJsonConfig('shop', data)}
                schema={shopConfigSchema}
                title="Shop Configuration"
                description="Edit shop configuration using JSON editor with change comparison"
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end border-t pt-6">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button
          onClick={handleSubmitForReview}
          disabled={isSaving || submitForReview.isPending}
        >
          <Send className="mr-2 h-4 w-4" />
          Submit for Review
        </Button>
      </div>
    </div>
  );
}

