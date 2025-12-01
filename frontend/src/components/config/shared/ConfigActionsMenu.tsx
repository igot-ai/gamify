'use client';

import * as React from 'react';
import { useRef } from 'react';
import { Download, Upload, Copy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ConfigActionsMenuProps {
  /** Callback to get current form data for export */
  onGetData: () => any;
  /** Callback when data is imported */
  onImport: (data: any) => void;
  /** Optional transform function for export data */
  transformExport?: (data: any) => any;
  /** File name for export (without extension) */
  exportFileName?: string;
  /** Additional class name */
  className?: string;
}

export function ConfigActionsMenu({
  onGetData,
  onImport,
  transformExport,
  exportFileName = 'config',
  className,
}: ConfigActionsMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export to JSON file
  const handleExport = () => {
    const data = onGetData();
    if (!data) {
      toast.error('No data to export');
      return;
    }
    
    const exportData = transformExport ? transformExport(data) : data;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported to JSON');
  };

  // Copy JSON to clipboard
  const handleCopyToClipboard = async () => {
    const data = onGetData();
    if (!data) {
      toast.error('No data to copy');
      return;
    }
    
    const exportData = transformExport ? transformExport(data) : data;
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      toast.success('Configuration copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Trigger file input for import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onImport(data);
      toast.success('Configuration imported from JSON');
    } catch (error) {
      toast.error('Failed to import configuration. Please check the file format.');
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-9 w-9 p-0 ${className || ''}`}
              >
                <Zap className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import/Export actions</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export to JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import from JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </TooltipProvider>
  );
}

