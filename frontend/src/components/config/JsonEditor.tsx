'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';
import { JsonDiffViewer } from './JsonDiffViewer';
import { getDefaultTemplate, type ConfigType } from '@/lib/configTemplates';
import { safeParseJson } from '@/lib/utils';
import { Code, FileText, Download, Upload, RotateCcw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface JsonEditorProps {
  configType: ConfigType;
  initialValue?: any;
  onChange?: (value: any) => void;
  onSave?: (value: any) => void;
  title?: string;
  description?: string;
  schema?: any; // Zod schema for validation (optional)
}

export function JsonEditor({
  configType,
  initialValue,
  onChange,
  onSave,
  title,
  description,
  schema,
}: JsonEditorProps) {
  const [jsonValue, setJsonValue] = useState<any>(initialValue || null);
  const [jsonText, setJsonText] = useState<string>(
    initialValue ? JSON.stringify(initialValue, null, 2) : ''
  );
  const [activeTab, setActiveTab] = useState<'form' | 'json' | 'diff'>('form');
  const [originalValue, setOriginalValue] = useState<any>(initialValue || null);
  const [hasChanges, setHasChanges] = useState(false);

  // Update when initialValue changes from parent
  useMemo(() => {
    if (initialValue !== undefined) {
      setJsonValue(initialValue);
      setJsonText(initialValue ? JSON.stringify(initialValue, null, 2) : '');
      // Only update original if it's null (first load)
      if (originalValue === null) {
        setOriginalValue(initialValue || null);
      }
    }
  }, [initialValue, originalValue]);

  // Track changes
  useMemo(() => {
    const changed =
      JSON.stringify(jsonValue) !== JSON.stringify(originalValue);
    setHasChanges(changed);
  }, [jsonValue, originalValue]);

  const handleLoadDefault = useCallback(() => {
    const defaultTemplate = getDefaultTemplate(configType);
    setJsonValue(defaultTemplate);
    setJsonText(JSON.stringify(defaultTemplate, null, 2));
    setOriginalValue(null); // Reset original when loading default
    setHasChanges(true);
    onChange?.(defaultTemplate);
    toast.success('Default template loaded');
  }, [configType, onChange]);

  const handleJsonTextChange = useCallback(
    (text: string) => {
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        setJsonValue(parsed);
        setHasChanges(JSON.stringify(parsed) !== JSON.stringify(originalValue));
        onChange?.(parsed);
      } catch (error) {
        // Invalid JSON, but don't update value
        // User is still typing
      }
    },
    [onChange, originalValue]
  );

  const handleValidateJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Validate with schema if provided
      if (schema) {
        const result = schema.safeParse(parsed);
        if (!result.success) {
          toast.error('Validation failed: ' + result.error.errors[0].message);
          return false;
        }
      }

      setJsonValue(parsed);
      setHasChanges(JSON.stringify(parsed) !== JSON.stringify(originalValue));
      onChange?.(parsed);
      toast.success('JSON is valid');
      return true;
    } catch (error: any) {
      toast.error('Invalid JSON: ' + error.message);
      return false;
    }
  }, [jsonText, schema, onChange, originalValue]);

  const handleSave = useCallback(() => {
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    if (handleValidateJson()) {
      onSave?.(jsonValue);
      setOriginalValue(jsonValue);
      setHasChanges(false);
      toast.success('Configuration saved');
    }
  }, [hasChanges, handleValidateJson, jsonValue, onSave]);

  const handleReset = useCallback(() => {
    setJsonValue(originalValue || null);
    setJsonText(
      originalValue ? JSON.stringify(originalValue, null, 2) : ''
    );
    setHasChanges(false);
    onChange?.(originalValue || null);
    toast.info('Changes reset');
  }, [originalValue, onChange]);

  const handleDownload = useCallback(() => {
    if (!jsonValue) {
      toast.error('No data to download');
      return;
    }

    const blob = new Blob([JSON.stringify(jsonValue, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${configType}_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration downloaded');
  }, [jsonValue, configType]);

  const handleUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = safeParseJson(content);
          
          if (schema) {
            const result = schema.safeParse(parsed);
            if (!result.success) {
              toast.error('Validation failed: ' + result.error.errors[0].message);
              return;
            }
          }

          setJsonValue(parsed);
          setJsonText(JSON.stringify(parsed, null, 2));
          setHasChanges(true);
          onChange?.(parsed);
          toast.success('Configuration uploaded');
        } catch (error: any) {
          toast.error('Failed to parse file: ' + error.message);
        }
      };
      reader.readAsText(file);
    },
    [onChange, schema]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title || `${configType} Configuration`}</CardTitle>
              <CardDescription>
                {description || 'Edit configuration using form or JSON editor'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadDefault}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Load Default
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!jsonValue}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="form">
                <FileText className="h-4 w-4 mr-2" />
                Form View
              </TabsTrigger>
              <TabsTrigger value="json">
                <Code className="h-4 w-4 mr-2" />
                JSON View
              </TabsTrigger>
              <TabsTrigger value="diff" disabled={!hasChanges}>
                <Eye className="h-4 w-4 mr-2" />
                Changes
                {hasChanges && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-4 mt-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Form view is available through the dedicated form components.
                  Use the JSON view to edit directly, or switch to the form tabs
                  above.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="json" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">JSON Editor</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleValidateJson}
                  >
                    Validate JSON
                  </Button>
                </div>
                <Textarea
                  value={jsonText}
                  onChange={(e) => handleJsonTextChange(e.target.value)}
                  className={cn(
                    'font-mono text-sm min-h-[400px]',
                    jsonText &&
                      (() => {
                        try {
                          JSON.parse(jsonText);
                          return '';
                        } catch {
                          return 'border-destructive';
                        }
                      })()
                  )}
                  placeholder="Enter JSON configuration..."
                />
                {jsonText && (() => {
                  try {
                    JSON.parse(jsonText);
                    return null;
                  } catch (error: any) {
                    return (
                      <p className="text-sm text-destructive">
                        Invalid JSON: {error.message}
                      </p>
                    );
                  }
                })()}
              </div>
            </TabsContent>

            <TabsContent value="diff" className="mt-4">
              {hasChanges && originalValue !== null ? (
                <JsonDiffViewer
                  oldValue={originalValue}
                  newValue={jsonValue}
                  title="Configuration Changes"
                  description="Review all changes made to the configuration"
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {originalValue === null
                      ? 'Load a default template or existing config to see changes'
                      : 'No changes detected'}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                >
                  Reset Changes
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

