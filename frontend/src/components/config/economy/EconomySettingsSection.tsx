'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  Settings, 
  Save, 
  Info,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
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
import { type EconomyConfig } from '@/lib/validations/economyConfig';

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

  const handleSaveNow = () => {
    const settings = form.getValues('settings');
    if (onSave) {
      onSave(settings);
    }
    toast.success('Settings saved to ScriptableObject');
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

      {/* In-App Purchase Settings */}
      <Card className="border-border/40 shadow-stripe-sm">
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
                    <FormItem className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 p-4">
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
                          className="h-9 bg-muted/30"
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
          <Card className="border-border/40 shadow-stripe-sm">
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
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Save Settings to the ScriptableObject
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

