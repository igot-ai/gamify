'use client';

import type { RefObject } from 'react';
import type { SectionType, SectionConfigVersion, SectionConfig } from '@/types/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, Plus } from 'lucide-react';
import { getFormRegistry, type FormRefs } from '@/lib/formRegistry';

interface SectionFormRendererProps {
  sectionType: SectionType;
  selectedVersion: SectionConfigVersion | null;
  configData: any;
  config: SectionConfig | null;
  formRefs: FormRefs;
  onSave: (data?: any) => Promise<void>;
  onDataChange: (data: any) => void;
  isSaving: boolean;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onCreateVersion: () => void;
  isCreatingVersion: boolean;
}

export function SectionFormRenderer({
  sectionType,
  selectedVersion,
  configData,
  config,
  formRefs,
  onSave,
  onDataChange,
  isSaving,
  activeTab,
  onTabChange,
  onCreateVersion,
  isCreatingVersion,
}: SectionFormRendererProps) {
  // No version selected state
  if (!selectedVersion) {
    return (
      <Card className="border-border/30 shadow-stripe-sm">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p className="mb-4">No version selected. Create a version to get started.</p>
          <Button
            onClick={onCreateVersion}
            disabled={isCreatingVersion}
          >
            {isCreatingVersion ? (
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

  // Get form registry entry
  const registry = getFormRegistry(sectionType);
  
  if (!registry) {
    return (
      <Card className="border-border/30 shadow-stripe-sm">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>No form available for this section type.</p>
        </CardContent>
      </Card>
    );
  }

  const FormComponent = registry.component;
  const formRef = formRefs[sectionType] as RefObject<any>;

  // Handle special cases for each form type
  // Economy has special props
  if (sectionType === 'economy') {
    return (
      <FormComponent
        key={selectedVersion.id}
        ref={formRef}
        initialData={configData}
        onSave={onSave}
        isSaving={isSaving}
        activeTab={activeTab}
        hideSidebar={true}
        readOnly={false}
      />
    );
  }

  // Tutorial has special props
  if (sectionType === 'tutorial') {
    return (
      <FormComponent
        key={selectedVersion.id}
        ref={formRef}
        initialData={configData}
        onSubmit={onSave}
        onChange={onDataChange}
        isSaving={isSaving}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    );
  }

  // Shop has special props (no ref, has configId)
  if (sectionType === 'shop') {
    return (
      <FormComponent
        key={selectedVersion.id}
        initialData={configData}
        onSubmit={onSave}
        configId={config?.id || ''}
      />
    );
  }

  // Standard form props for all other forms
  return (
    <FormComponent
      key={selectedVersion.id}
      ref={formRef}
      initialData={configData}
      onSubmit={onSave}
      onChange={onDataChange}
      isSaving={isSaving}
    />
  );
}

