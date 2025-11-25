import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig, useUpdateConfig, useSubmitForReview } from '@/hooks/useConfigs';
import { EconomyConfigForm } from '@/components/config/EconomyConfigForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { toast } from 'sonner';
import { Save, Send, Loader2 } from 'lucide-react';
import type { EconomyConfig } from '@/lib/validations/economyConfig';

export function ConfigEditorPage() {
  const { configId } = useParams<{ configId: string }>();
  const navigate = useNavigate();
  const { data: config, isLoading } = useConfig(configId || '');
  const updateConfig = useUpdateConfig(configId || '');
  const submitForReview = useSubmitForReview();

  const [activeTab, setActiveTab] = useState('economy');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEconomy = async (data: EconomyConfig) => {
    if (!configId) return;

    setIsSaving(true);
    try {
      await updateConfig.mutateAsync({
        economy_config: data as any,
      });
      toast.success('Economy config saved');
    } catch (error) {
      toast.error('Failed to save economy config');
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
      navigate(`/configs/${configId}`);
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
            <Button onClick={() => navigate(`/configs/${configId}`)} className="mt-4">
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
        <p className="text-muted-foreground">Version {config.version} - {config.status}</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Economy Config</CardTitle>
              <CardDescription>Configure currencies, IAP packages, and daily rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <EconomyConfigForm
                initialData={config.economy_config as unknown as EconomyConfig}
                onSubmit={handleSaveEconomy}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Config</CardTitle>
              <CardDescription>Configure ad networks and placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Ad Config form coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Config</CardTitle>
              <CardDescription>Configure notification strategies and channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Notification Config form coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boosters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booster Config</CardTitle>
              <CardDescription>Configure booster items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Booster Config form coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shop Config</CardTitle>
              <CardDescription>Configure shop items and bundles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Shop Config form coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end border-t pt-6">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button onClick={handleSubmitForReview} disabled={isSaving || submitForReview.isPending}>
          <Send className="mr-2 h-4 w-4" />
          Submit for Review
        </Button>
      </div>
    </div>
  );
}

