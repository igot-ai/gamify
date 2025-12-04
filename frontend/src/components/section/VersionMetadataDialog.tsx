'use client';

import { useState, useEffect } from 'react';
import type { SectionConfigVersion } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Loader2 } from 'lucide-react';

interface VersionMetadataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVersion: SectionConfigVersion | null;
  onSave: (meta: { title: string; description: string; experiment: string; variant: string }) => Promise<void>;
  isSaving: boolean;
}

export function VersionMetadataDialog({
  open,
  onOpenChange,
  selectedVersion,
  onSave,
  isSaving,
}: VersionMetadataDialogProps) {
  const [editingMeta, setEditingMeta] = useState({
    title: '',
    description: '',
    experiment: '',
    variant: '',
  });

  // Sync editingMeta with selectedVersion when dialog opens
  useEffect(() => {
    if (open && selectedVersion) {
      setEditingMeta({
        title: selectedVersion.title || '',
        description: selectedVersion.description || '',
        experiment: selectedVersion.experiment || '',
        variant: selectedVersion.variant || '',
      });
    }
  }, [open, selectedVersion]);

  const handleSave = async () => {
    await onSave(editingMeta);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Version Details</DialogTitle>
          <DialogDescription>
            Update the metadata for this version.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={editingMeta.title}
              onChange={(e) => setEditingMeta({ ...editingMeta, title: e.target.value })}
              placeholder="Version title"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={editingMeta.description}
              onChange={(e) => setEditingMeta({ ...editingMeta, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Experiment</label>
              <Input
                value={editingMeta.experiment}
                onChange={(e) => setEditingMeta({ ...editingMeta, experiment: e.target.value })}
                placeholder="e.g., exp_holiday_2024"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Variant</label>
              <Input
                value={editingMeta.variant}
                onChange={(e) => setEditingMeta({ ...editingMeta, variant: e.target.value })}
                placeholder="e.g., control, variant_a"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

