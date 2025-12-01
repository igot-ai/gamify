'use client';

import * as React from 'react';
import type { SectionType, SectionConfigVersion } from '@/types/api';
import { EconomyConfigLayout } from '@/components/config/economy';
import { AdConfigForm } from '@/components/config/ads';
import { NotificationConfigForm } from '@/components/config/notification';
import { ShopConfigForm } from '@/components/config/ShopConfigForm';
import { GameConfigForm } from '@/components/config/forms/GameConfigForm';
import { HapticConfigForm } from '@/components/config/forms/HapticConfigForm';
import { RemoveAdsConfigForm } from '@/components/config/forms/RemoveAdsConfigForm';
import { TileBundleConfigForm } from '@/components/config/forms/TileBundleConfigForm';
import { BoosterConfigForm } from '@/components/config/forms/BoosterConfigForm';
import { RatingConfigForm } from '@/components/config/forms/RatingConfigForm';
import { LinkConfigForm } from '@/components/config/forms/LinkConfigForm';
import { ChapterRewardConfigForm } from '@/components/config/forms/ChapterRewardConfigForm';
import { GameEconomyConfigForm } from '@/components/config/forms/GameEconomyConfigForm';
import { ShopSettingsConfigForm } from '@/components/config/forms/ShopSettingsConfigForm';
import { SpinConfigForm } from '@/components/config/forms/SpinConfigForm';
import { HintOfferConfigForm } from '@/components/config/forms/HintOfferConfigForm';
import { TutorialConfigForm } from '@/components/config/tutorial';
import { Card, CardContent } from '@/components/ui/Card';

interface VersionViewerProps {
  sectionType: SectionType;
  version: SectionConfigVersion;
  configId?: string;
}

/**
 * VersionViewer - Displays version configuration using the actual form components
 * in read-only mode. This provides a much better UX than raw JSON.
 */
export function VersionViewer({ sectionType, version, configId }: VersionViewerProps) {
  const configData = version.config_data || {};

  const renderForm = () => {
    // Common props for read-only forms
    const readOnlyProps = {
      initialData: configData,
      onSubmit: () => {}, // No-op
      onChange: () => {}, // No-op
      isSaving: false,
      readOnly: true,
    };

    switch (sectionType) {
      case 'economy':
        return (
          <EconomyConfigLayout
            initialData={configData}
            onSave={() => {}}
            isSaving={false}
            activeTab="currencies"
            hideSidebar={true}
            readOnly={true}
          />
        );
      case 'ads':
        return (
          <fieldset disabled className="space-y-6">
            <AdConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'notification':
        return (
          <fieldset disabled className="space-y-6">
            <NotificationConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'shop':
        return (
          <fieldset disabled className="space-y-6">
            <ShopConfigForm
              initialData={configData}
              onSubmit={() => {}}
              configId={configId || ''}
            />
          </fieldset>
        );
      case 'game':
        return (
          <fieldset disabled className="space-y-6">
            <GameConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'haptic':
        return (
          <fieldset disabled className="space-y-6">
            <HapticConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'remove_ads':
        return (
          <fieldset disabled className="space-y-6">
            <RemoveAdsConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'tile_bundle':
        return (
          <fieldset disabled className="space-y-6">
            <TileBundleConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'booster':
        return (
          <fieldset disabled className="space-y-6">
            <BoosterConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'rating':
        return (
          <fieldset disabled className="space-y-6">
            <RatingConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'link':
        return (
          <fieldset disabled className="space-y-6">
            <LinkConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'chapter_reward':
        return (
          <fieldset disabled className="space-y-6">
            <ChapterRewardConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'game_economy':
        return (
          <fieldset disabled className="space-y-6">
            <GameEconomyConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'shop_settings':
        return (
          <fieldset disabled className="space-y-6">
            <ShopSettingsConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'spin':
        return (
          <fieldset disabled className="space-y-6">
            <SpinConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'hint_offer':
        return (
          <fieldset disabled className="space-y-6">
            <HintOfferConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
        );
      case 'tutorial':
        return (
          <fieldset disabled className="space-y-6">
            <TutorialConfigForm
              initialData={configData}
              onSubmit={() => {}}
              onChange={() => {}}
              isSaving={false}
            />
          </fieldset>
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
    <>
      <style>{`
        .version-viewer fieldset[disabled] {
          opacity: 1;
          border: none;
          padding: 0;
          margin: 0;
        }
        /* Hide submit buttons */
        .version-viewer fieldset[disabled] button[type="submit"] {
          display: none !important;
        }
        /* Hide bottom action sections that contain submit buttons */
        .version-viewer fieldset[disabled] .flex.items-center.justify-end.gap-3.pt-4.border-t {
          display: none !important;
        }
        /* Make form inputs look read-only but still visible */
        .version-viewer fieldset[disabled] input,
        .version-viewer fieldset[disabled] textarea,
        .version-viewer fieldset[disabled] select {
          cursor: default;
          background-color: hsl(var(--muted));
          opacity: 0.9;
        }
        /* Allow scrolling */
        .version-viewer {
          overflow-y: auto;
        }
      `}</style>
      <div className="version-viewer">
        {renderForm()}
      </div>
    </>
  );
}

