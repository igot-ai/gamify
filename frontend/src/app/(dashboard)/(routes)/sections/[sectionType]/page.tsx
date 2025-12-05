'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSelectedGame } from '@/hooks/useSelectedGame';
import {
  useSectionConfig,
  useSectionConfigVersions,
  useUpdateVersion,
  useCreateVersion,
} from '@/hooks/useSectionConfigs';
import type { SectionType, SectionConfigVersion } from '@/types/api';
import { SECTION_METADATA } from '@/types/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VersionDropdown } from '@/components/config/VersionDropdown';
import { ConfigActionsMenu } from '@/components/config/shared/ConfigActionsMenu';
import { SectionTabs, SECTION_TABS } from '@/components/config/SectionTabs';
import { Loader2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';

// Import transform function
import { transformImportData } from '@/lib/importTransforms';

// Import constants
import { pathToSectionType, sectionTransformMap, sectionExportNameMap } from '@/lib/sectionConstants';

// Import form registry and components
import { getFormRegistry, type FormRefs } from '@/lib/formRegistry';
import { SectionFormRenderer } from '@/components/section/SectionFormRenderer';
import { VersionMetadataDialog } from '@/components/section/VersionMetadataDialog';


export default function SectionEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedGame, selectedGameId } = useSelectedGame();
  
  // Get section type from URL
  const sectionTypePath = params?.sectionType as string;
  const sectionType = pathToSectionType[sectionTypePath] as SectionType;
  const sectionMeta = sectionType ? SECTION_METADATA[sectionType] : null;
  
  // Get active tab from URL query parameter
  const urlTab = searchParams?.get('tab');
  const defaultTab = SECTION_TABS[sectionType]?.[0]?.id || 'currencies';
  const [activeTab, setActiveTab] = useState(urlTab || defaultTab);

  // Version state
  const [selectedVersion, setSelectedVersion] = useState<SectionConfigVersion | null>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  // Version metadata edit dialog
  const [editMetaDialogOpen, setEditMetaDialogOpen] = useState(false);
  
  // Discard changes confirmation dialog
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<SectionConfigVersion | null>(null);

  // Form refs - kept as object for simplicity
  const formRefs: FormRefs = {
    economy: useRef(null),
    ads: useRef(null),
    notification: useRef(null),
    shop: useRef(null),
    game: useRef(null),
    haptic: useRef(null),
    remove_ads: useRef(null),
    tile_bundle: useRef(null),
    booster: useRef(null),
    rating: useRef(null),
    link: useRef(null),
    chapter_reward: useRef(null),
    game_economy: useRef(null),
    shop_settings: useRef(null),
    spin: useRef(null),
    hint_offer: useRef(null),
    tutorial: useRef(null),
    analytics: useRef(null),
    ux: useRef(null),
  };

  // Fetch the single config for this game+section (auto-creates if needed)
  const { data: config, isLoading: isLoadingConfig } = useSectionConfig({
    game_id: selectedGameId || '',
    section_type: sectionType,
  });

  // Fetch versions for this config
  const { data: versionsData, refetch: refetchVersions } = useSectionConfigVersions(config?.id || '');
  
  const updateVersionMutation = useUpdateVersion();
  const createVersionMutation = useCreateVersion();

  // Reset version when config changes (i.e., when switching games)
  useEffect(() => {
    setSelectedVersion(null);
    setCurrentData(null);
    setHasLocalChanges(false);
  }, [config?.id]);

  // Auto-select first version when versions load
  useEffect(() => {
    if (versionsData?.versions && versionsData.versions.length > 0 && !selectedVersion) {
      const firstVersion = versionsData.versions[0];
      // Transform from PascalCase (Unity format) to camelCase for form use
      const rawData = firstVersion.config_data ?? {};
      const configData = transformImportData(sectionType, rawData);
      setSelectedVersion(firstVersion);
      setCurrentData(configData);
    }
  }, [versionsData, selectedVersion, sectionType]);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', tabId);
    const newUrl = `/sections/${sectionTypePath}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  // Update active tab from URL
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Get form data using registry
  const getFormData = useCallback(() => {
    const registry = getFormRegistry(sectionType);
    if (!registry) return currentData;
    return registry.getData(formRefs[sectionType]) ?? currentData;
  }, [sectionType, currentData]);

  // Reset form with data using registry
  const resetFormWithData = useCallback((data: any) => {
    const registry = getFormRegistry(sectionType);
    if (registry) {
      registry.reset(formRefs[sectionType], data);
    }
  }, [sectionType]);

  const handleSave = async (data?: any) => {
    if (!config || !selectedVersion) {
      toast.error('No version selected');
      return;
    }

    setIsSaving(true);
    try {
      const saveData = data ?? getFormData() ?? currentData;
      // Transform to PascalCase (Unity format) before saving
      const transformFn = sectionTransformMap[sectionType];
      const unityFormatData = transformFn ? transformFn(saveData) : saveData;
      await updateVersionMutation.mutateAsync({ 
        sectionConfigId: config.id,
        versionId: selectedVersion.id, 
        data: { config_data: unityFormatData }
      });
      setCurrentData(saveData);
      setHasLocalChanges(false);
      toast.success('Saved');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataChange = (data: any) => {
    setCurrentData(data);
    setHasLocalChanges(true);
  };

  const handleVersionSelect = (version: SectionConfigVersion) => {
    if (hasLocalChanges) {
      setPendingVersion(version);
      setDiscardDialogOpen(true);
      return;
    }
    
    // Transform from PascalCase (Unity format) to camelCase for form use
    const rawData = version.config_data ?? {};
    const configData = transformImportData(sectionType, rawData);
    setSelectedVersion(version);
    setCurrentData(configData);
    setHasLocalChanges(false);
    resetFormWithData(configData);
  };

  const handleConfirmDiscard = () => {
    if (pendingVersion) {
      // Transform from PascalCase (Unity format) to camelCase for form use
      const rawData = pendingVersion.config_data ?? {};
      const configData = transformImportData(sectionType, rawData);
      setSelectedVersion(pendingVersion);
      setCurrentData(configData);
      setHasLocalChanges(false);
      resetFormWithData(configData);
      setPendingVersion(null);
    }
    setDiscardDialogOpen(false);
  };

  const handleVersionCreated = (version: SectionConfigVersion) => {
    refetchVersions();
    // Transform from PascalCase (Unity format) to camelCase for form use
    const rawData = version.config_data ?? {};
    const configData = transformImportData(sectionType, rawData);
    setSelectedVersion(version);
    setCurrentData(configData);
    setHasLocalChanges(false);
    resetFormWithData(configData);
  };

  const handleCreateVersion = () => {
    if (config) {
      createVersionMutation.mutateAsync({
        sectionConfigId: config.id,
        data: { title: 'Initial Version' }
      }).then((newVersion) => {
        if (newVersion) {
          handleVersionCreated(newVersion);
        }
      });
    }
  };

  const handleImportData = (importedData: any) => {
    const transformedData = transformImportData(sectionType, importedData);
    setCurrentData(transformedData);
    setHasLocalChanges(true);
    resetFormWithData(transformedData);
  };

  const getTransformFunction = useCallback(() => {
    return sectionTransformMap[sectionType];
  }, [sectionType]);

  const getExportFileName = useCallback(() => {
    return sectionExportNameMap[sectionType] || 'config';
  }, [sectionType]);

  const handleSaveMeta = async (meta: { title: string; description: string; experiment: string; variant: string }) => {
    if (!config || !selectedVersion) return;
    
    try {
      await updateVersionMutation.mutateAsync({
        sectionConfigId: config.id,
        versionId: selectedVersion.id,
        data: meta,
      });
      
      setSelectedVersion({
        ...selectedVersion,
        ...meta,
      });
      
      refetchVersions();
      setEditMetaDialogOpen(false);
      toast.success('Version updated');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update version');
    }
  };

  // Show error if invalid section type
  if (!sectionType || !sectionMeta) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Invalid section type</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no game selected
  if (!selectedGameId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please select a game from the header dropdown</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoadingConfig) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const configData = currentData ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - sticky below main header */}
      <div className="border-b border-border/40 bg-card/95 backdrop-blur-md sticky top-14 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold tracking-tight">
                {sectionMeta.label}
              </h1>
              <VersionDropdown
                config={config || null}
                selectedVersion={selectedVersion}
                onVersionSelect={handleVersionSelect}
                onVersionCreated={handleVersionCreated}
              />
              {selectedVersion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMetaDialogOpen(true)}
                  className="h-8 px-2"
                  title="Edit version details"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedVersion && (
                <ConfigActionsMenu
                  onGetData={getFormData}
                  onImport={handleImportData}
                  transformExport={getTransformFunction()}
                  exportFileName={getExportFileName()}
                />
              )}
              {hasLocalChanges && (
                <span className="text-sm text-amber-600">Unsaved changes</span>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedGame?.name}
          </p>
        </div>

        {/* Horizontal Tabs - Only for Economy section */}
        {sectionType === 'economy' && (
          <div className="px-6">
            <SectionTabs
              sectionType={sectionType}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              disabled={false}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="rounded-xl bg-white overflow-hidden shadow-sm p-6">
          <SectionFormRenderer
            sectionType={sectionType}
            selectedVersion={selectedVersion}
            configData={configData}
            config={config || null}
            formRefs={formRefs}
            onSave={handleSave}
            onDataChange={handleDataChange}
            isSaving={isSaving}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onCreateVersion={handleCreateVersion}
            isCreatingVersion={createVersionMutation.isPending}
          />
        </div>
      </div>

      {/* Edit Version Metadata Dialog */}
      <VersionMetadataDialog
        open={editMetaDialogOpen}
        onOpenChange={setEditMetaDialogOpen}
        selectedVersion={selectedVersion}
        onSave={handleSaveMeta}
        isSaving={updateVersionMutation.isPending}
      />

      <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingVersion(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
