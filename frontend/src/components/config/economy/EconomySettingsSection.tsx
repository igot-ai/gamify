'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  Settings, 
  Save, 
  Info,
  Loader2,
  FileText,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ReadOnlyField } from '@/components/ui/ReadOnlyField';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/Form';
import { toast } from 'sonner';
import { type EconomyConfig, type EconomySettings } from '@/lib/validations/economyConfig';
import { JsonEditor } from './shared/JsonEditor';

interface EconomySettingsSectionProps {
  onSave?: (data: EconomyConfig['settings']) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

export function EconomySettingsSection({ 
  onSave, 
  isSaving = false,
  readOnly = false,
}: EconomySettingsSectionProps) {
  const form = useFormContext<EconomyConfig>();
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [originalSettings, setOriginalSettings] = useState<EconomySettings | null>(null);
  const initializedRef = useRef(false);

  // Get current settings data
  const settings = form.watch('settings');

  // Store original settings on initial load for diff comparison
  useEffect(() => {
    if (!initializedRef.current && settings && typeof settings === 'object') {
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      initializedRef.current = true;
    }
  }, [settings]);

  const hasChanges = settings && originalSettings 
    ? JSON.stringify(settings) !== JSON.stringify(originalSettings)
    : settings !== originalSettings;

  const handleSaveNow = () => {
    const currentSettings = form.getValues('settings');
    if (onSave) {
      onSave(currentSettings);
      // Update original after save
      if (currentSettings && typeof currentSettings === 'object') {
        setOriginalSettings(JSON.parse(JSON.stringify(currentSettings)));
      } else {
        setOriginalSettings(null);
      }
    }
    toast.success('Settings saved to ScriptableObject');
  };

  // Handle JSON changes from the JSON editor
  const handleJsonChange = (data: EconomySettings) => {
    if (data && typeof data === 'object') {
      form.setValue('settings', data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          Economy Settings
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure IAP settings and manage your configuration
        </p>
      </div>

      {/* Tabs for Form/JSON */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'json')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form" className="text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Form
          </TabsTrigger>
          <TabsTrigger value="json" className="text-sm relative">
            <Code className="h-4 w-4 mr-2" />
            JSON
            {hasChanges && (
              <span className="ml-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-4 space-y-6">
          {/* In-App Purchase Settings */}
          <Card className="border-border/80 shadow-stripe-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                In-App Purchase Settings
              </CardTitle>
              <CardDescription className="text-sm">
                Configure IAP behavior and remote config integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* IAP Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">IAP Configuration</h4>
                
                {readOnly ? (
                  <>
                    <ReadOnlyField 
                      label="Enable Refund Processing" 
                      value={form.getValues('settings.enableRefundProcessing')} 
                    />
                    <ReadOnlyField 
                      label="Remote Config Key" 
                      value={form.getValues('settings.remoteConfigKey')} 
                    />
                  </>
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="settings.enableRefundProcessing"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Enable Refund Processing</FormLabel>
                            <FormDescription className="text-xs">
                              Automatically handle refund requests from app stores
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
                      name="settings.remoteConfigKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Remote Config Key</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="ECONOMY_CONFIG"
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Only show action cards when not read-only */}
          {!readOnly && (
            <>
              {/* Save Settings */}
              <Card className="border-border/80 shadow-stripe-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Save className="h-4 w-4 text-primary" />
                    Save Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    type="button"
                    onClick={handleSaveNow}
                    disabled={isSaving}
                    className="w-full h-10"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                    <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Now'}
                  </Button>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-600">
                      Save Settings to the ScriptableObject
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <JsonEditor
            value={settings}
            originalValue={originalSettings}
            onChange={readOnly ? undefined : handleJsonChange}
            readOnly={readOnly}
          />
          
          {/* Save Button for JSON tab */}
          {!readOnly && (
            <div className="flex items-center justify-end pt-4 mt-4 border-t border-border/30">
              <Button
                type="button"
                onClick={handleSaveNow}
                disabled={isSaving}
                className="h-9 shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
