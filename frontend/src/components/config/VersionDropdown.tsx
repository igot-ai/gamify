'use client';

import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { ChevronDown, RotateCcw, Loader2 } from 'lucide-react';
import type { SectionConfig, SectionConfigVersion } from '@/types/api';
import { useSectionConfigVersions, useRollbackConfig } from '@/hooks/useSectionConfigs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VersionDropdownProps {
  config: SectionConfig | null;
  className?: string;
  onRollback?: () => void;
  onVersionSelect?: (versionData: any, versionNumber: number, isPublished: boolean) => void;
}

export function VersionDropdown({
  config,
  className,
  onRollback,
  onVersionSelect,
}: VersionDropdownProps) {
  const [rollbackVersion, setRollbackVersion] = useState<SectionConfigVersion | null>(null);
  const [confirmRollbackOpen, setConfirmRollbackOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<number | null>(null);

  const { data: versionsData, isLoading: isLoadingVersions } = useSectionConfigVersions(
    config?.id || ''
  );
  const rollbackMutation = useRollbackConfig();

  const versions = versionsData?.versions || [];

  // Reset viewing version when config changes (e.g., after save/publish)
  useEffect(() => {
    if (config && !config.has_unpublished_changes) {
      setViewingVersion(null);
    }
  }, [config?.has_unpublished_changes]);

  const getStatusLabel = () => {
    if (!config) return 'No config';
    
    // If viewing a specific version
    if (viewingVersion !== null) {
      const isCurrent = config.published_version === viewingVersion;
      return isCurrent 
        ? `Version ${viewingVersion}`
        : `Version ${viewingVersion} (read-only)`;
    }
    
    // Always show current version if we have one
    if (config.published_version) {
      return `Version ${config.published_version}`;
    }
    
    // No published version yet
    if (config.has_unpublished_changes) {
      return 'Draft (unpublished)';
    }
    
    return 'No changes';
  };

  const handleVersionClick = (e: React.MouseEvent, version: SectionConfigVersion) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Load version data into form and track which version is being viewed
    if (version.config_data && onVersionSelect) {
      const isPublished = config?.published_version === version.version;
      setViewingVersion(version.version);
      onVersionSelect(version.config_data, version.version, isPublished);
    }
  };

  const handleRollbackClick = (e: React.MouseEvent, version: SectionConfigVersion) => {
    e.preventDefault();
    e.stopPropagation();
    setRollbackVersion(version);
    setConfirmRollbackOpen(true);
  };

  const handleConfirmRollback = async () => {
    if (!config || !rollbackVersion) return;

    try {
      await rollbackMutation.mutateAsync({
        sectionConfigId: config.id,
        version: rollbackVersion.version,
      });
      toast.success(`Rolled back to v${rollbackVersion.version}. Publish to deploy.`);
      setConfirmRollbackOpen(false);
      setViewingVersion(null); // Reset viewing state after rollback
      onRollback?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to rollback');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn('gap-2 h-9 w-[210px] justify-between', className)}
          >
            <span>{getStatusLabel()}</span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {/* Version History Header */}
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Version History
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />

          {/* Version List */}
          <div className="max-h-[280px] overflow-y-auto">
            {isLoadingVersions ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : versions.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No versions yet
              </div>
            ) : (
              <div className="py-1">
                {versions.map((version) => {
                  const isPublished = config?.published_version === version.version;
                  const isViewing = viewingVersion === version.version;
                  const isViewingOld = isViewing && !isPublished;
                  
                  return (
                    <div
                      key={version.id}
                      className={cn(
                        'px-2 py-2 mx-1 rounded-md cursor-pointer transition-colors',
                        isViewingOld
                          ? 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50'
                          : isPublished 
                            ? 'bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50' 
                            : 'hover:bg-muted/50'
                      )}
                      onClick={(e) => handleVersionClick(e, version)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">v{version.version}</span>
                          {isViewingOld && (
                            <span className="text-[10px] font-medium bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded dark:bg-blue-800 dark:text-blue-200">
                              Viewing
                            </span>
                          )}
                          {isPublished && (
                            <span className="text-[10px] font-medium bg-green-200 text-green-800 px-1.5 py-0.5 rounded dark:bg-green-800 dark:text-green-200">
                              Current
                            </span>
                          )}
                        </div>
                        {!isPublished && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleRollbackClick(e, version)}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                            title="Rollback to this version (copies to draft)"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(version.published_at)} · {version.published_by}
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

      {/* Confirm Rollback Dialog */}
      <Dialog open={confirmRollbackOpen} onOpenChange={setConfirmRollbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rollback</DialogTitle>
            <DialogDescription>
              This will copy v{rollbackVersion?.version} configuration to your draft.
              You will need to publish to deploy the changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRollbackOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRollback}
              disabled={rollbackMutation.isPending}
            >
              {rollbackMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Rollback to v{rollbackVersion?.version}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Keep old interface for backward compatibility during transition
interface LegacyVersionDropdownProps {
  currentConfig: SectionConfig | null;
  allConfigs: SectionConfig[];
  onCreateNewVersion: () => void;
  onSelectVersion: (configId: string) => void;
  isCreating?: boolean;
  className?: string;
}

/**
 * @deprecated Use VersionDropdown with new props instead
 */
export function LegacyVersionDropdown({
  currentConfig,
  allConfigs: _allConfigs,
  onCreateNewVersion: _onCreateNewVersion,
  onSelectVersion: _onSelectVersion,
  isCreating: _isCreating = false,
  className,
}: LegacyVersionDropdownProps) {
  // Redirect to new component - config is now single record
  return (
    <VersionDropdown
      config={currentConfig}
      className={className}
    />
  );
}
