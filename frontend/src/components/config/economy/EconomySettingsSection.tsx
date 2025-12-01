'use client';

import * as React from 'react';
import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  CheckCircle,
  AlertCircle,
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
  onExport?: () => void;
  onImport?: (data: EconomyConfig) => void;
  onValidate?: () => Promise<boolean>;
  readOnly?: boolean;
}

export function EconomySettingsSection({ 
  onSave, 
  isSaving = false,
  onExport, 
  onImport,
  onValidate,
  readOnly = false,
}: EconomySettingsSectionProps) {
  const form = useFormContext<EconomyConfig>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveNow = () => {
    const settings = form.getValues('settings');
    if (onSave) {
      onSave(settings);
    }
    toast.success('Settings saved to ScriptableObject');
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
      toast.success('Configuration exported to JSON');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (onImport) {
        onImport(data);
        toast.success('Configuration imported from JSON');
      }
    } catch (error) {
      toast.error('Failed to import configuration. Please check the file format.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleValidate = async () => {
    if (onValidate) {
      const isValid = await onValidate();
      if (isValid) {
        toast.success('Configuration is valid!');
      } else {
        toast.error('Configuration has validation errors. Please check the form.');
      }
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

          {/* Import/Export */}
          <Card className="border-border/40 shadow-stripe-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                Import/Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExport}
                  className="h-10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to JSON
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImportClick}
                  className="h-10"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import from JSON
                </Button>
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  <p><strong>Export:</strong> Save configuration as JSON file</p>
                  <p><strong>Import:</strong> Load configuration from JSON file</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card className="border-border/40 shadow-stripe-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                className="w-full h-10"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate Configuration
              </Button>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Check for duplicate IDs, invalid references, and other configuration issues
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

