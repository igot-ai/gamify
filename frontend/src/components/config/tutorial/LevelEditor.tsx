'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StepEditor } from './StepEditor';
import {
  ETutorialStep,
  STEP_TYPE_LABELS,
  STEP_TYPE_ICONS,
  getDefaultStepData,
  generateStepId,
  type TutorialLevel,
  type TutorialStep,
} from '@/lib/validations/tutorialConfig';

interface LevelEditorProps {
  level: TutorialLevel;
  onChange: (level: TutorialLevel) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function LevelEditor({
  level,
  onChange,
  onDelete,
  canDelete,
}: LevelEditorProps) {
  // Ref to store generated IDs for steps that don't have one
  // Maps step content hash to stable ID
  const generatedIdsRef = React.useRef<Map<string, string>>(new Map());
  
  // Generate a stable key for each step
  const getStepKey = React.useCallback((step: TutorialStep, index: number): string => {
    // If step has _id, use it directly
    if (step._id) return step._id;
    
    // Create a hash based on step content to identify it
    const hash = `${step.Type}-${index}-${JSON.stringify(step.Data).slice(0, 50)}`;
    
    // Check if we already generated an ID for this hash
    let id = generatedIdsRef.current.get(hash);
    if (!id) {
      id = generateStepId();
      generatedIdsRef.current.set(hash, id);
    }
    return id;
  }, []);

  const handleLevelNumberChange = (newLevel: number) => {
    onChange({ ...level, Level: newLevel });
  };

  const handleAddStep = (type: ETutorialStep) => {
    const newStep: TutorialStep = {
      Type: type,
      Data: getDefaultStepData(type),
      Focus: false,
      _id: generateStepId(),
    };
    onChange({
      ...level,
      Steps: [...level.Steps, newStep],
    });
  };

  const handleStepChange = (index: number, step: TutorialStep) => {
    const newSteps = [...level.Steps];
    newSteps[index] = step;
    onChange({ ...level, Steps: newSteps });
  };

  const handleStepRemove = (index: number) => {
    const newSteps = [...level.Steps];
    newSteps.splice(index, 1);
    onChange({ ...level, Steps: newSteps });
  };

  return (
    <div className="space-y-4">
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Level Number:</Label>
            <Input
              type="number"
              min={1}
              value={level.Level}
              onChange={(e) => handleLevelNumberChange(parseInt(e.target.value) || 1)}
              className="h-8 w-20"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {level.Steps.length} step{level.Steps.length !== 1 ? 's' : ''}
          </span>
        </div>

        {canDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete Level
          </Button>
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {level.Steps.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border/50 bg-muted/10 p-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              No steps in this level yet
            </p>
            <AddStepButton onAddStep={handleAddStep} />
          </div>
        ) : (
          <>
            {level.Steps.map((step, index) => (
              <StepEditor
                key={getStepKey(step, index)}
                step={step}
                stepIndex={index}
                onChange={(updatedStep) => handleStepChange(index, updatedStep)}
                onRemove={() => handleStepRemove(index)}
              />
            ))}

            <div className="flex justify-center pt-2">
              <AddStepButton onAddStep={handleAddStep} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// ADD STEP BUTTON COMPONENT
// ============================================

interface AddStepButtonProps {
  onAddStep: (type: ETutorialStep) => void;
}

function AddStepButton({ onAddStep }: AddStepButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Step
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="center"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {Object.entries(STEP_TYPE_LABELS).map(([value, label]) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onAddStep(parseInt(value) as ETutorialStep)}
          >
            <span className="mr-2">{STEP_TYPE_ICONS[parseInt(value) as ETutorialStep]}</span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

