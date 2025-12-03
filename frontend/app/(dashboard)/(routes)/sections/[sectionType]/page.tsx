'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
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
import { Input } from '@/components/ui/Input';
import { VersionDropdown } from '@/components/config/VersionDropdown';
import { ConfigActionsMenu } from '@/components/config/shared/ConfigActionsMenu';
import { SectionTabs, SECTION_TABS } from '@/components/config/SectionTabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Loader2, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

// Export transform functions
import { transformEconomyConfigToExport } from '@/lib/economyExportTransform';
import { transformAdConfigToExport } from '@/lib/adsExportTransform';
import { transformNotificationConfigToExport } from '@/lib/notificationExportTransform';
import { transformGameConfigToExport } from '@/lib/gameExportTransform';
import { transformHapticConfigToExport } from '@/lib/hapticExportTransform';
import { transformRemoveAdsConfigToExport } from '@/lib/removeAdsExportTransform';
import { transformTileBundleConfigToExport } from '@/lib/tileBundleExportTransform';
import { transformBoosterConfigToExport } from '@/lib/boosterExportTransform';
import { transformRatingConfigToExport } from '@/lib/ratingExportTransform';
import { transformLinkConfigToExport } from '@/lib/linkExportTransform';
import { transformChapterRewardConfigToExport } from '@/lib/chapterRewardExportTransform';
import { transformGameEconomyConfigToExport } from '@/lib/gameEconomyExportTransform';
import { transformShopSettingsConfigToExport } from '@/lib/shopSettingsExportTransform';
import { transformSpinConfigToExport } from '@/lib/spinExportTransform';
import { transformHintOfferConfigToExport } from '@/lib/hintOfferExportTransform';
import { transformTutorialConfigToExport } from '@/lib/tutorialExportTransform';

// Import transform function
import { transformImportData } from '@/lib/importTransforms';

// Form components
import { EconomyConfigLayout, type EconomyConfigLayoutRef } from '@/components/config/economy';
import { AdConfigForm, type AdConfigFormRef } from '@/components/config/ads';
import { NotificationConfigForm, type NotificationConfigFormRef } from '@/components/config/notification';
import { ShopConfigForm } from '@/components/config/ShopConfigForm';
import { GameConfigForm, type GameConfigFormRef } from '@/components/config/forms/GameConfigForm';
import { HapticConfigForm, type HapticConfigFormRef } from '@/components/config/forms/HapticConfigForm';
import { RemoveAdsConfigForm, type RemoveAdsConfigFormRef } from '@/components/config/forms/RemoveAdsConfigForm';
import { TileBundleConfigForm, type TileBundleConfigFormRef } from '@/components/config/forms/TileBundleConfigForm';
import { BoosterConfigForm, type BoosterConfigFormRef } from '@/components/config/forms/BoosterConfigForm';
import { RatingConfigForm, type RatingConfigFormRef } from '@/components/config/forms/RatingConfigForm';
import { LinkConfigForm, type LinkConfigFormRef } from '@/components/config/forms/LinkConfigForm';
import { ChapterRewardConfigForm, type ChapterRewardConfigFormRef } from '@/components/config/forms/ChapterRewardConfigForm';
import { GameEconomyConfigForm, type GameEconomyConfigFormRef } from '@/components/config/forms/GameEconomyConfigForm';
import { ShopSettingsConfigForm, type ShopSettingsConfigFormRef } from '@/components/config/forms/ShopSettingsConfigForm';
import { SpinConfigForm, type SpinConfigFormRef } from '@/components/config/forms/SpinConfigForm';
import { HintOfferConfigForm, type HintOfferConfigFormRef } from '@/components/config/forms/HintOfferConfigForm';
import { TutorialConfigForm, type TutorialConfigFormRef } from '@/components/config/tutorial';

// Map URL path to section type
const pathToSectionType: Record<string, SectionType> = {
  'economy': 'economy',
  'ads': 'ads',
  'notification': 'notification',
  'shop': 'shop',
  'booster': 'booster',
  'chapter-reward': 'chapter_reward',
  'game': 'game',
  'analytics': 'analytics',
  'ux': 'ux',
  'haptic': 'haptic',
  'remove-ads': 'remove_ads',
  'tile-bundle': 'tile_bundle',
  'rating': 'rating',
  'link': 'link',
  'game-economy': 'game_economy',
  'shop-settings': 'shop_settings',
  'spin': 'spin',
  'hint-offer': 'hint_offer',
  'tutorial': 'tutorial',
};

// Map section type to export transform function
const sectionTransformMap: Record<SectionType, ((data: any) => any) | undefined> = {
  'economy': transformEconomyConfigToExport,
  'ads': transformAdConfigToExport,
  'notification': transformNotificationConfigToExport,
  'shop': undefined, // No transform for shop
  'booster': transformBoosterConfigToExport,
  'chapter_reward': transformChapterRewardConfigToExport,
  'game': transformGameConfigToExport,
  'analytics': undefined,
  'ux': undefined,
  'haptic': transformHapticConfigToExport,
  'remove_ads': transformRemoveAdsConfigToExport,
  'tile_bundle': transformTileBundleConfigToExport,
  'rating': transformRatingConfigToExport,
  'link': transformLinkConfigToExport,
  'game_economy': transformGameEconomyConfigToExport,
  'shop_settings': transformShopSettingsConfigToExport,
  'spin': transformSpinConfigToExport,
  'hint_offer': transformHintOfferConfigToExport,
  'tutorial': transformTutorialConfigToExport,
};

// Map section type to export file name
const sectionExportNameMap: Record<SectionType, string> = {
  'economy': 'economy-config',
  'ads': 'ads-config',
  'notification': 'notification-config',
  'shop': 'shop-config',
  'booster': 'booster-config',
  'chapter_reward': 'chapter-reward-config',
  'game': 'game-config',
  'analytics': 'analytics-config',
  'ux': 'ux-config',
  'haptic': 'haptic-config',
  'remove_ads': 'remove-ads-config',
  'tile_bundle': 'tile-bundle-config',
  'rating': 'rating-config',
  'link': 'link-config',
  'game_economy': 'game-economy-config',
  'shop_settings': 'shop-settings-config',
  'spin': 'spin-config',
  'hint_offer': 'hint-offer-config',
  'tutorial': 'tutorial-config',
};

export default function SectionEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedGame, selectedGameId } = useGame();
  
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
  const [editingMeta, setEditingMeta] = useState({
    title: '',
    description: '',
    experiment: '',
    variant: '',
  });

  // Form refs
  const economyFormRef = useRef<EconomyConfigLayoutRef>(null);
  const adFormRef = useRef<AdConfigFormRef>(null);
  const notificationFormRef = useRef<NotificationConfigFormRef>(null);
  const gameFormRef = useRef<GameConfigFormRef>(null);
  const hapticFormRef = useRef<HapticConfigFormRef>(null);
  const removeAdsFormRef = useRef<RemoveAdsConfigFormRef>(null);
  const tileBundleFormRef = useRef<TileBundleConfigFormRef>(null);
  const boosterFormRef = useRef<BoosterConfigFormRef>(null);
  const ratingFormRef = useRef<RatingConfigFormRef>(null);
  const linkFormRef = useRef<LinkConfigFormRef>(null);
  const chapterRewardFormRef = useRef<ChapterRewardConfigFormRef>(null);
  const gameEconomyFormRef = useRef<GameEconomyConfigFormRef>(null);
  const shopSettingsFormRef = useRef<ShopSettingsConfigFormRef>(null);
  const spinFormRef = useRef<SpinConfigFormRef>(null);
  const hintOfferFormRef = useRef<HintOfferConfigFormRef>(null);
  const tutorialFormRef = useRef<TutorialConfigFormRef>(null);

  // Fetch the single config for this game+section (auto-creates if needed)
  const { data: config, isLoading: isLoadingConfig } = useSectionConfig({
    game_id: selectedGameId || '',
    section_type: sectionType,
  });

  // Fetch versions for this config
  const { data: versionsData, refetch: refetchVersions } = useSectionConfigVersions(config?.id || '');
  
  const updateVersionMutation = useUpdateVersion();
  const createVersionMutation = useCreateVersion();

  // Auto-select first version when versions load
  useEffect(() => {
    if (versionsData?.versions && versionsData.versions.length > 0 && !selectedVersion) {
      const firstVersion = versionsData.versions[0];
      setSelectedVersion(firstVersion);
      setCurrentData(firstVersion.config_data);
    }
  }, [versionsData, selectedVersion]);

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

  const getFormData = useCallback(() => {
    switch (sectionType) {
      case 'economy':
        return economyFormRef.current?.getData();
      case 'ads':
        return adFormRef.current?.getData();
      case 'notification':
        return notificationFormRef.current?.getData();
      case 'game':
        return gameFormRef.current?.getData();
      case 'haptic':
        return hapticFormRef.current?.getData();
      case 'remove_ads':
        return removeAdsFormRef.current?.getData();
      case 'tile_bundle':
        return tileBundleFormRef.current?.getData();
      case 'booster':
        return boosterFormRef.current?.getData();
      case 'rating':
        return ratingFormRef.current?.getData();
      case 'link':
        return linkFormRef.current?.getData();
      case 'chapter_reward':
        return chapterRewardFormRef.current?.getData();
      case 'game_economy':
        return gameEconomyFormRef.current?.getData();
      case 'shop_settings':
        return shopSettingsFormRef.current?.getData();
      case 'spin':
        return spinFormRef.current?.getData();
      case 'hint_offer':
        return hintOfferFormRef.current?.getData();
      case 'tutorial':
        return tutorialFormRef.current?.getData();
      default:
        return currentData;
    }
  }, [sectionType, currentData]);

  const handleSave = async (data?: any) => {
    if (!config || !selectedVersion) {
      toast.error('No version selected');
      return;
    }

    setIsSaving(true);
    try {
      const saveData = data ?? getFormData() ?? currentData;
      await updateVersionMutation.mutateAsync({ 
        sectionConfigId: config.id,
        versionId: selectedVersion.id, 
        data: { config_data: saveData }
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
    // Check for unsaved changes
    if (hasLocalChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) {
        return;
      }
    }
    
    setSelectedVersion(version);
    setCurrentData(version.config_data);
    setHasLocalChanges(false);
    
    // Reset form refs
    resetFormWithData(version.config_data);
  };

  const handleVersionCreated = (version: SectionConfigVersion) => {
    refetchVersions();
    setSelectedVersion(version);
    setCurrentData(version.config_data);
    setHasLocalChanges(false);
  };

  const resetFormWithData = (data: any) => {
    switch (sectionType) {
      case 'ads':
        adFormRef.current?.reset?.(data);
        break;
      case 'notification':
        notificationFormRef.current?.reset?.(data);
        break;
      case 'game':
        gameFormRef.current?.reset?.(data);
        break;
      case 'haptic':
        hapticFormRef.current?.reset?.(data);
        break;
      case 'remove_ads':
        removeAdsFormRef.current?.reset?.(data);
        break;
      case 'tile_bundle':
        tileBundleFormRef.current?.reset?.(data);
        break;
      case 'booster':
        boosterFormRef.current?.reset?.(data);
        break;
      case 'rating':
        ratingFormRef.current?.reset?.(data);
        break;
      case 'link':
        linkFormRef.current?.reset?.(data);
        break;
      case 'chapter_reward':
        chapterRewardFormRef.current?.reset?.(data);
        break;
      case 'game_economy':
        gameEconomyFormRef.current?.reset?.(data);
        break;
      case 'shop_settings':
        shopSettingsFormRef.current?.reset?.(data);
        break;
      case 'spin':
        spinFormRef.current?.reset?.(data);
        break;
      case 'hint_offer':
        hintOfferFormRef.current?.reset?.(data);
        break;
      case 'tutorial':
        tutorialFormRef.current?.reset?.(data);
        break;
      case 'economy':
        economyFormRef.current?.reset?.(data);
        break;
    }
  };

  // Handle import from JSON - resets form with imported data
  const handleImportData = (importedData: any) => {
    // Transform from Unity format to internal format
    const transformedData = transformImportData(sectionType, importedData);
    console.log('importedData (raw):', importedData);
    console.log('transformedData:', transformedData);
    
    setCurrentData(transformedData);
    setHasLocalChanges(true);
    resetFormWithData(transformedData);
  };

  // Get transform function for current section
  const getTransformFunction = useCallback(() => {
    return sectionTransformMap[sectionType];
  }, [sectionType]);

  // Get export file name for current section
  const getExportFileName = useCallback(() => {
    return sectionExportNameMap[sectionType] || 'config';
  }, [sectionType]);

  // Handle edit version metadata
  const handleEditMeta = () => {
    if (!selectedVersion) return;
    setEditingMeta({
      title: selectedVersion.title || '',
      description: selectedVersion.description || '',
      experiment: selectedVersion.experiment || '',
      variant: selectedVersion.variant || '',
    });
    setEditMetaDialogOpen(true);
  };

  const handleSaveMeta = async () => {
    if (!config || !selectedVersion) return;
    
    try {
      await updateVersionMutation.mutateAsync({
        sectionConfigId: config.id,
        versionId: selectedVersion.id,
        data: editingMeta,
      });
      
      // Update local state
      setSelectedVersion({
        ...selectedVersion,
        ...editingMeta,
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

  // Config data to display
  const configData = currentData ?? {};

  const renderContent = () => {
    if (!selectedVersion) {
      return (
        <Card className="border-border/30 shadow-stripe-sm">
          <CardContent className="p-8 text-center text-muted-foreground">
            <p className="mb-4">No version selected. Create a version to get started.</p>
            <Button
              onClick={() => {
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
              }}
              disabled={createVersionMutation.isPending}
            >
              {createVersionMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create First Version
            </Button>
          </CardContent>
        </Card>
      );
    }

    switch (sectionType) {
      case 'economy':
        return (
          <EconomyConfigLayout
            ref={economyFormRef}
            initialData={configData}
            onSave={handleSave}
            isSaving={isSaving}
            activeTab={activeTab}
            hideSidebar={true}
            readOnly={false}
          />
        );
      case 'ads':
        return (
          <AdConfigForm
            ref={adFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'notification':
        return (
          <NotificationConfigForm
            ref={notificationFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'shop':
        return (
          <ShopConfigForm
            initialData={configData}
            onSubmit={handleSave}
            configId={config?.id || ''}
          />
        );
      case 'game':
        return (
          <GameConfigForm
            ref={gameFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'haptic':
        return (
          <HapticConfigForm
            ref={hapticFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'remove_ads':
        return (
          <RemoveAdsConfigForm
            ref={removeAdsFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'tile_bundle':
        return (
          <TileBundleConfigForm
            ref={tileBundleFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'booster':
        return (
          <BoosterConfigForm
            ref={boosterFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'rating':
        return (
          <RatingConfigForm
            ref={ratingFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'link':
        return (
          <LinkConfigForm
            ref={linkFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'chapter_reward':
        return (
          <ChapterRewardConfigForm
            ref={chapterRewardFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'game_economy':
        return (
          <GameEconomyConfigForm
            ref={gameEconomyFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'shop_settings':
        return (
          <ShopSettingsConfigForm
            ref={shopSettingsFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'spin':
        return (
          <SpinConfigForm
            ref={spinFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'hint_offer':
        return (
          <HintOfferConfigForm
            ref={hintOfferFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
          />
        );
      case 'tutorial':
        return (
          <TutorialConfigForm
            ref={tutorialFormRef}
            initialData={configData}
            onSubmit={handleSave}
            onChange={handleDataChange}
            isSaving={isSaving}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        );
      default:
        return (
          <Card className="border-border/30 shadow-stripe-sm">
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No form available for this section type.</p>
            </CardContent>
          </Card>
        );
    }
  };

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
                  onClick={handleEditMeta}
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
          {renderContent()}
        </div>
      </div>

      {/* Edit Version Metadata Dialog */}
      <Dialog open={editMetaDialogOpen} onOpenChange={setEditMetaDialogOpen}>
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
              onClick={() => setEditMetaDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMeta}
              disabled={updateVersionMutation.isPending}
            >
              {updateVersionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
