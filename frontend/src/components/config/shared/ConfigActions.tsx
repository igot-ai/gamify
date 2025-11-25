'use client';

import * as React from 'react';
import { Save, X, Download, Upload, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConfigActionsProps {
  onSave?: () => void;
  onCancel?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onReset?: () => void;
  onValidate?: () => void;
  hasChanges?: boolean;
  isValid?: boolean;
  isSaving?: boolean;
  className?: string;
  showExport?: boolean;
  showImport?: boolean;
  showReset?: boolean;
  showValidate?: boolean;
}

export function ConfigActions({
  onSave,
  onCancel,
  onExport,
  onImport,
  onReset,
  onValidate,
  hasChanges = false,
  isValid = true,
  isSaving = false,
  className = '',
  showExport = true,
  showImport = true,
  showReset = false,
  showValidate = false,
}: ConfigActionsProps) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-lg border border-border/30 bg-muted/10 p-4 ${className}`}>
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {showExport && onExport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  className="h-9 shadow-stripe-xs transition-all hover:shadow-stripe-sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export configuration as JSON file</p>
              </TooltipContent>
            </Tooltip>
          )}
          {showImport && onImport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onImport}
                  className="h-9 shadow-stripe-xs transition-all hover:shadow-stripe-sm"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import JSON
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import configuration from JSON file</p>
              </TooltipContent>
            </Tooltip>
          )}
          {showValidate && onValidate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onValidate}
                  className="h-9 shadow-stripe-xs transition-all hover:shadow-stripe-sm"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Validate
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Check for configuration errors</p>
              </TooltipContent>
            </Tooltip>
          )}
          {showReset && onReset && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="h-9 shadow-stripe-xs transition-all hover:shadow-stripe-sm"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset to default configuration</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {(onSave || onCancel) && <Separator orientation="vertical" className="h-8" />}

        <div className="flex items-center gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="h-9 shadow-stripe-xs transition-all hover:shadow-stripe-sm"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              type="button"
              onClick={onSave}
              disabled={!hasChanges || !isValid || isSaving}
              className="h-9 shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}

