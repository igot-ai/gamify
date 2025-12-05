'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
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
import { ChevronDown, Plus, Copy, Trash2, Loader2, Edit2 } from 'lucide-react';
import type { SectionConfig, SectionConfigVersion, SectionConfigVersionCreate } from '@/types/api';
import { 
  useSectionConfigVersions, 
  useCreateVersion, 
  useDeleteVersion,
  useDuplicateVersion 
} from '@/hooks/useSectionConfigs';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface VersionDropdownProps {
  config: SectionConfig | null;
  selectedVersion: SectionConfigVersion | null;
  className?: string;
  onVersionSelect?: (version: SectionConfigVersion) => void;
  onVersionCreated?: (version: SectionConfigVersion) => void;
}

export function VersionDropdown({
  config,
  selectedVersion,
  className,
  onVersionSelect,
  onVersionCreated,
}: VersionDropdownProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<SectionConfigVersion | null>(null);
  const [newVersionData, setNewVersionData] = useState<SectionConfigVersionCreate>({
    title: '',
    description: '',
    experiment: '',
    variant: '',
  });

  const { data: versionsData, isLoading: isLoadingVersions } = useSectionConfigVersions(
    config?.id || ''
  );
  const createVersionMutation = useCreateVersion();
  const deleteVersionMutation = useDeleteVersion();
  const duplicateVersionMutation = useDuplicateVersion();

  const versions = versionsData?.versions || [];

  const getStatusLabel = () => {
    if (!config) return 'No config';
    if (!selectedVersion) return 'Select version';
    
    const title = selectedVersion.title || 'Untitled';
    const experimentVariant = [selectedVersion.experiment, selectedVersion.variant]
      .filter(Boolean)
      .join('/');
    
    return experimentVariant ? `${title} (${experimentVariant})` : title;
  };

  const handleVersionClick = (e: React.MouseEvent, version: SectionConfigVersion) => {
    e.preventDefault();
    e.stopPropagation();
    onVersionSelect?.(version);
  };

  const handleCreateVersion = async () => {
    if (!config) return;

    try {
      const newVersion = await createVersionMutation.mutateAsync({
        sectionConfigId: config.id,
        data: newVersionData,
      });
      toast.success('Version created');
      setCreateDialogOpen(false);
      setNewVersionData({ title: '', description: '', experiment: '', variant: '' });
      if (newVersion) {
        onVersionCreated?.(newVersion);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create version');
    }
  };

  const handleDuplicateVersion = async (e: React.MouseEvent, version: SectionConfigVersion) => {
    e.preventDefault();
    e.stopPropagation();
    if (!config) return;

    try {
      const newVersion = await duplicateVersionMutation.mutateAsync({
        sectionConfigId: config.id,
        versionId: version.id,
      });
      toast.success('Version duplicated');
      if (newVersion) {
        onVersionCreated?.(newVersion);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to duplicate version');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, version: SectionConfigVersion) => {
    e.preventDefault();
    e.stopPropagation();
    setVersionToDelete(version);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!config || !versionToDelete) return;

    try {
      await deleteVersionMutation.mutateAsync({
        sectionConfigId: config.id,
        versionId: versionToDelete.id,
      });
      toast.success('Version deleted');
      setDeleteDialogOpen(false);
      setVersionToDelete(null);
      // If we deleted the selected version, clear selection
      if (selectedVersion?.id === versionToDelete.id) {
        onVersionSelect?.(null as any);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to delete version');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn('gap-2 h-9 min-w-[180px] max-w-[280px] justify-between', className)}
          >
            <span className="truncate">{getStatusLabel()}</span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          {/* Header with Create Button */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider p-0">
              Versions
            </DropdownMenuLabel>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
          
          <DropdownMenuSeparator />

          {/* Version List */}
          <div className="max-h-[320px] overflow-y-auto">
            {isLoadingVersions ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : versions.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No versions yet. Create one to get started.
              </div>
            ) : (
              <div className="py-1">
                {versions.map((version) => {
                  const isSelected = selectedVersion?.id === version.id;
                  
                  return (
                    <div
                      key={version.id}
                      className={cn(
                        'px-2 py-2 mx-1 rounded-md cursor-pointer transition-colors group',
                        isSelected
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-muted/50'
                      )}
                      onClick={(e) => handleVersionClick(e, version)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-medium text-sm truncate">
                            {version.title || 'Untitled'}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDuplicateVersion(e, version)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            title="Duplicate version"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, version)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            title="Delete version"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium">Experiment:</span> {version.experiment || '—'} <span className="mx-1">|</span> <span className="font-medium">Variant:</span> {version.variant || '—'}
                      </div>
                      {version.description && (
                        <div className="text-xs text-muted-foreground mt-1 italic truncate">
                          "{version.description}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Version Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              Create a new version container for your configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newVersionData.title || ''}
                onChange={(e) => setNewVersionData({ ...newVersionData, title: e.target.value })}
                placeholder="e.g., Initial Config, Holiday Event"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newVersionData.description || ''}
                onChange={(e) => setNewVersionData({ ...newVersionData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Experiment</label>
                <Input
                  value={newVersionData.experiment || ''}
                  onChange={(e) => setNewVersionData({ ...newVersionData, experiment: e.target.value })}
                  placeholder="e.g., exp_holiday_2024"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Variant</label>
                <Input
                  value={newVersionData.variant || ''}
                  onChange={(e) => setNewVersionData({ ...newVersionData, variant: e.target.value })}
                  placeholder="e.g., control, variant_a"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateVersion}
              disabled={createVersionMutation.isPending}
            >
              {createVersionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{versionToDelete?.title || 'Untitled'}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteVersionMutation.isPending}
            >
              {deleteVersionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
