'use client';

import { useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/Textarea';
import { ScrollArea } from '@/components/ui/ScrollArea';
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
  const [isValid, setIsValid] = useState(true);

  // Sync jsonText when value prop changes externally
  useEffect(() => {
    const newText = value ? JSON.stringify(value, null, 2) : '';
    if (newText !== jsonText) {
      setJsonText(newText);
      setParseError(null);
      setIsValid(true);
    }
  }, [value]);

  const handleJsonTextChange = useCallback(
    (text: string) => {
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        setParseError(null);
        setIsValid(true);
        onChange?.(parsed);
      } catch (error: any) {
        setParseError(error.message);
        setIsValid(false);
      }
    },
    [onChange]
  );

  return (
    <div className={cn('space-y-3', className)}>
      <Textarea
        value={jsonText}
        onChange={(e) => handleJsonTextChange(e.target.value)}
        readOnly={readOnly}
        className={cn(
          'font-mono text-[13px] leading-relaxed min-h-[400px] resize-none bg-muted/30',
          !isValid && 'border-destructive focus-visible:ring-destructive'
        )}
        placeholder="Enter JSON configuration..."
      />

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
