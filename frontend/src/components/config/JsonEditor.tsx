'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { getDefaultTemplate, type ConfigType } from '@/lib/configTemplates';
import { safeParseJson } from '@/lib/utils';
import { Code, FileText, Download, Upload, RotateCcw, Eye, Plus, Minus } from 'lucide-react';
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
  defaultView?: 'form' | 'json' | 'diff';
}

interface DiffLine {
  type: 'added' | 'removed' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

/**
 * Generate unified diff lines from JSON objects
 */
function generateUnifiedDiff(oldValue: any, newValue: any): DiffLine[] {
  const oldLines = oldValue ? JSON.stringify(oldValue, null, 2).split('\n') : [];
  const newLines = newValue ? JSON.stringify(newValue, null, 2).split('\n') : [];
  
  const diffLines: DiffLine[] = [];
  let oldLineNum = 1;
  let newLineNum = 1;
  let i = 0;
  let j = 0;
  
  while (i < oldLines.length || j < newLines.length) {
    const oldLine = oldLines[i];
    const newLine = newLines[j];
    
    if (i >= oldLines.length) {
      // Only new lines remaining
      diffLines.push({
        type: 'added',
        content: newLine,
        newLineNumber: newLineNum++,
      });
      j++;
    } else if (j >= newLines.length) {
      // Only old lines remaining
      diffLines.push({
        type: 'removed',
        content: oldLine,
        oldLineNumber: oldLineNum++,
      });
      i++;
    } else if (oldLine === newLine) {
      // Lines match - context
      diffLines.push({
        type: 'context',
        content: oldLine,
        oldLineNumber: oldLineNum++,
        newLineNumber: newLineNum++,
      });
      i++;
      j++;
    } else {
      // Lines differ - mark old as removed, new as added
      diffLines.push({
        type: 'removed',
        content: oldLine,
        oldLineNumber: oldLineNum++,
      });
      diffLines.push({
        type: 'added',
        content: newLine,
        newLineNumber: newLineNum++,
      });
      i++;
      j++;
    }
  }
  
  return diffLines;
}

export function JsonEditor({
  configType,
  initialValue,
  onChange,
  onSave,
  title,
  description,
  schema,
  defaultView = 'form',
}: JsonEditorProps) {
  const [jsonValue, setJsonValue] = useState<any>(() => initialValue || null);
  const [jsonText, setJsonText] = useState<string>(() =>
    initialValue ? JSON.stringify(initialValue, null, 2) : ''
  );
  const [activeTab, setActiveTab] = useState<'form' | 'json' | 'diff'>(defaultView);
  const [originalValue, setOriginalValue] = useState<any>(() => initialValue || null);
  const [showDiffInline, setShowDiffInline] = useState(false);

  const serializedInitialValue = useMemo(() => {
    if (initialValue === undefined) return undefined;
    try {
      return JSON.stringify(initialValue);
    } catch (error) {
      console.error('Failed to serialize initial JSON value', error);
      return undefined;
    }
  }, [initialValue]);

  useEffect(() => {
    if (serializedInitialValue === undefined) return;
    try {
      const parsed = serializedInitialValue ? JSON.parse(serializedInitialValue) : null;
      setJsonValue(parsed);
      setOriginalValue(parsed);
      setJsonText(parsed ? JSON.stringify(parsed, null, 2) : '');
    } catch (error) {
      console.error('Failed to parse initial JSON value', error);
    }
  }, [serializedInitialValue]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(jsonValue) !== JSON.stringify(originalValue);
  }, [jsonValue, originalValue]);

  const diffLines = useMemo(() => {
    if (!originalValue || !hasChanges) return [];
    return generateUnifiedDiff(originalValue, jsonValue);
  }, [originalValue, jsonValue, hasChanges]);

  const diffStats = useMemo(() => {
    const added = diffLines.filter((d) => d.type === 'added').length;
    const removed = diffLines.filter((d) => d.type === 'removed').length;
    return { added, removed };
  }, [diffLines]);

  const handleLoadDefault = useCallback(() => {
    const defaultTemplate = getDefaultTemplate(configType);
    setJsonValue(defaultTemplate);
    setJsonText(JSON.stringify(defaultTemplate, null, 2));
    setOriginalValue(null); // Reset original when loading default
    onChange?.(defaultTemplate);
    toast.success('Default template loaded');
  }, [configType, onChange]);

  const handleJsonTextChange = useCallback(
    (text: string) => {
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        setJsonValue(parsed);
        onChange?.(parsed);
      } catch (error) {
        // Invalid JSON, but don't update value
        // User is still typing
      }
    },
    [onChange]
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
      onChange?.(parsed);
      toast.success('JSON is valid');
      return true;
    } catch (error: any) {
      toast.error('Invalid JSON: ' + error.message);
      return false;
    }
  }, [jsonText, schema, onChange]);

  const handleSave = useCallback(() => {
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    if (handleValidateJson()) {
      onSave?.(jsonValue);
      setOriginalValue(jsonValue);
      toast.success('Configuration saved');
    }
  }, [hasChanges, handleValidateJson, jsonValue, onSave]);

  const handleReset = useCallback(() => {
    setJsonValue(originalValue || null);
    setJsonText(
      originalValue ? JSON.stringify(originalValue, null, 2) : ''
    );
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">
                <FileText className="h-4 w-4 mr-2" />
                Form View
              </TabsTrigger>
              <TabsTrigger value="json">
                <Code className="h-4 w-4 mr-2" />
                JSON Editor
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
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">JSON Editor</label>
                    {hasChanges && (
                      <div className="flex gap-1">
                        {diffStats.removed > 0 && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-xs">
                            <Minus className="h-2.5 w-2.5 mr-1" />
                            {diffStats.removed}
                          </Badge>
                        )}
                        {diffStats.added > 0 && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs">
                            <Plus className="h-2.5 w-2.5 mr-1" />
                            {diffStats.added}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasChanges && originalValue && (
                      <Button
                        type="button"
                        variant={showDiffInline ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowDiffInline(!showDiffInline)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showDiffInline ? 'Hide Changes' : 'Show Changes'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleValidateJson}
                    >
                      Validate JSON
                    </Button>
                  </div>
                </div>
                
                {showDiffInline && hasChanges && originalValue ? (
                  <ScrollArea className="h-[500px] w-full">
                    <div className="rounded-lg border bg-slate-950 overflow-hidden font-mono text-sm">
                      {diffLines.map((line, index) => (
                        <DiffLineComponent key={index} line={line} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <Textarea
                    value={jsonText}
                    onChange={(e) => handleJsonTextChange(e.target.value)}
                    className={cn(
                      'font-mono text-sm min-h-[500px]',
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
                )}
                {!showDiffInline && jsonText && (() => {
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

interface DiffLineProps {
  line: DiffLine;
}

function DiffLineComponent({ line }: DiffLineProps) {
  const getLineStyle = () => {
    switch (line.type) {
      case 'added':
        return 'bg-green-500/10 text-green-400 border-l-2 border-green-500';
      case 'removed':
        return 'bg-red-500/10 text-red-400 border-l-2 border-red-500';
      case 'context':
        return 'bg-transparent text-slate-300';
      default:
        return 'bg-transparent text-slate-300';
    }
  };

  const getPrefix = () => {
    switch (line.type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'context':
        return ' ';
      default:
        return ' ';
    }
  };

  const getLineNumbers = () => {
    const oldNum = line.oldLineNumber?.toString().padStart(4, ' ') || '    ';
    const newNum = line.newLineNumber?.toString().padStart(4, ' ') || '    ';
    
    if (line.type === 'removed') {
      return <span className="text-red-500">{oldNum}    </span>;
    } else if (line.type === 'added') {
      return <span className="text-green-500">    {newNum}</span>;
    } else {
      return <span className="text-slate-600">{oldNum} {newNum}</span>;
    }
  };

  return (
    <div
      className={cn(
        'flex items-start px-2 py-0.5 hover:bg-white/5 transition-colors font-mono text-xs',
        getLineStyle()
      )}
    >
      <span className="inline-block select-none mr-3 opacity-50">
        {getLineNumbers()}
      </span>
      <span
        className={cn(
          'inline-block w-4 text-center mr-2 select-none font-bold',
          line.type === 'added' && 'text-green-500',
          line.type === 'removed' && 'text-red-500',
          line.type === 'context' && 'text-slate-600'
        )}
      >
        {getPrefix()}
      </span>
      <pre className="flex-1 whitespace-pre overflow-x-auto">
        <code>{line.content}</code>
      </pre>
    </div>
  );
}

