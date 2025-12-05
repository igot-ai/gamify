'use client';

import { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JsonEditorProps {
  value: any;
  originalValue?: any;
  onChange?: (data: any) => void;
  readOnly?: boolean;
  className?: string;
}

export function JsonEditor({
  value,
  originalValue,
  onChange,
  readOnly = false,
  className,
}: JsonEditorProps) {
  const [jsonText, setJsonText] = useState<string>(() =>
    value ? JSON.stringify(value, null, 2) : ''
  );
  const [parseError, setParseError] = useState<string | null>(null);

  // Sync jsonText when value prop changes externally
  useEffect(() => {
    const newText = value ? JSON.stringify(value, null, 2) : '';
    if (newText !== jsonText) {
      setJsonText(newText);
      setParseError(null);
    }
  }, [value]);

  const handleJsonTextChange = useCallback(
    (text: string | undefined) => {
      const newText = text || '';
      setJsonText(newText);
      try {
        const parsed = JSON.parse(newText);
        setParseError(null);
        onChange?.(parsed);
      } catch (error: any) {
        setParseError(error.message);
      }
    },
    [onChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      <div className="rounded-lg overflow-hidden border border-border">
        <Editor
          height="400px"
          language="json"
          value={jsonText}
          onChange={handleJsonTextChange}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            folding: true,
            renderLineHighlight: 'line',
            padding: { top: 12, bottom: 12 },
          }}
          theme="light"
        />
      </div>

      {/* Error message */}
      {parseError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">
            Invalid JSON: {parseError}
          </p>
        </div>
      )}
    </div>
  );
}
