'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/ui/Form';
import { ConfigFormSection } from '../shared/ConfigFormSection';
import { LevelEditor } from './LevelEditor';
import { cn } from '@/lib/utils';
import {
  tutorialConfigSchema,
  defaultTutorialConfig,
  defaultTutorialLevel,
  type TutorialConfig,
  type TutorialLevel,
} from '@/lib/validations/tutorialConfig';

interface TutorialConfigFormProps {
  initialData?: TutorialConfig;
  onSubmit: (data: TutorialConfig) => void;
  onChange?: (data: TutorialConfig) => void;
  onCancel?: () => void;
  isSaving?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export interface TutorialConfigFormRef {
  getData: () => TutorialConfig;
}

export const TutorialConfigForm = forwardRef<TutorialConfigFormRef, TutorialConfigFormProps>(
  function TutorialConfigForm({
    initialData,
    onSubmit,
    onChange,
    onCancel,
    isSaving = false,
    activeTab,
    onTabChange,
  }, ref) {
    const mergedDefaults = initialData
      ? {
          ...defaultTutorialConfig,
          ...initialData,
          data: {
            ...defaultTutorialConfig.data,
            ...initialData?.data,
          },
        }
      : defaultTutorialConfig;

    const form = useForm<TutorialConfig>({
      resolver: zodResolver(tutorialConfigSchema),
      defaultValues: mergedDefaults,
    });

    // Track selected level index (0-based, for array access)
    const levels = form.watch('data.Levels') || [];
    const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);

    // Sync with external activeTab if provided (format: "level-1", "level-2", etc.)
    useEffect(() => {
      if (activeTab && activeTab.startsWith('level-')) {
        const levelNum = parseInt(activeTab.replace('level-', ''));
        const index = levels.findIndex(l => l.Level === levelNum);
        if (index >= 0) {
          setSelectedLevelIndex(index);
        }
      }
    }, [activeTab, levels]);

    useImperativeHandle(ref, () => ({
      getData: () => form.getValues(),
    }));

    const watchedValues = form.watch();
    useEffect(() => {
      if (onChange) {
        const currentValues = JSON.stringify(watchedValues);
        const initialValues = JSON.stringify(initialData);
        if (currentValues !== initialValues) {
          onChange(watchedValues);
        }
      }
    }, [watchedValues, onChange, initialData]);

    const isValid = form.formState.isValid;
    const handleSubmit = form.handleSubmit(onSubmit);

    const handleAddLevel = () => {
      const currentLevels = form.getValues('data.Levels') || [];
      const maxLevel = currentLevels.length > 0 
        ? Math.max(...currentLevels.map(l => l.Level)) 
        : 0;
      const newLevel: TutorialLevel = {
        ...defaultTutorialLevel,
        Level: maxLevel + 1,
      };
      form.setValue('data.Levels', [...currentLevels, newLevel], { shouldDirty: true });
      setSelectedLevelIndex(currentLevels.length);
      onTabChange?.(`level-${newLevel.Level}`);
    };

    const handleDeleteLevel = (index: number) => {
      const currentLevels = form.getValues('data.Levels') || [];
      if (currentLevels.length <= 1) return;
      
      const newLevels = [...currentLevels];
      newLevels.splice(index, 1);
      form.setValue('data.Levels', newLevels, { shouldDirty: true });
      
      // Adjust selected index if needed
      if (selectedLevelIndex >= newLevels.length) {
        setSelectedLevelIndex(Math.max(0, newLevels.length - 1));
      }
    };

    const handleLevelChange = (index: number, level: TutorialLevel) => {
      const currentLevels = form.getValues('data.Levels') || [];
      const newLevels = [...currentLevels];
      newLevels[index] = level;
      form.setValue('data.Levels', newLevels, { shouldDirty: true });
    };

    const handleTabClick = (index: number) => {
      setSelectedLevelIndex(index);
      const level = levels[index];
      if (level) {
        onTabChange?.(`level-${level.Level}`);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tutorial Levels with Tabs */}
          <ConfigFormSection
            title="Tutorial Levels"
            description="Define the levels and steps for this tutorial"
          >
            {/* Level Tabs */}
            <div className="mb-4">
              <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
                {levels.map((level, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                      selectedLevelIndex === index
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    )}
                  >
                    Level {level.Level}
                    <span className="text-xs text-muted-foreground">
                      ({level.Steps.length})
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAddLevel}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Level
                </button>
              </div>
            </div>

            {/* Selected Level Editor */}
            {levels.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border/50 bg-muted/10 p-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No tutorial levels defined yet
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddLevel}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add First Level
                </Button>
              </div>
            ) : levels[selectedLevelIndex] ? (
              <LevelEditor
                level={levels[selectedLevelIndex]}
                onChange={(level) => handleLevelChange(selectedLevelIndex, level)}
                onDelete={() => handleDeleteLevel(selectedLevelIndex)}
                canDelete={levels.length > 1}
              />
            ) : null}
          </ConfigFormSection>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || isSaving}
              className="shadow-stripe-sm transition-all hover:shadow-stripe-md hover:-translate-y-0.5"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    );
  }
);

