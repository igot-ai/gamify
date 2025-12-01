'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import {
  ETutorialStep,
  STEP_TYPE_LABELS,
  STEP_TYPE_ICONS,
  getDefaultStepData,
  type TutorialStep,
  type Tile,
  type LoadBoardData,
  type ShowToastData,
  type ShowPopupData,
  type HintTapData,
  type HintPointData,
  defaultTile,
} from '@/lib/validations/tutorialConfig';

// ============================================
// TILE EDITOR COMPONENT
// ============================================

interface TileEditorProps {
  tiles: Tile[];
  onChange: (tiles: Tile[]) => void;
}

function TileEditor({ tiles, onChange }: TileEditorProps) {
  const handleAdd = () => {
    const newId = tiles.length > 0 ? Math.max(...tiles.map(t => t.id)) + 1 : 0;
    onChange([...tiles, { ...defaultTile, id: newId }]);
  };

  const handleRemove = (index: number) => {
    const newTiles = [...tiles];
    newTiles.splice(index, 1);
    onChange(newTiles);
  };

  const handleChange = (index: number, field: keyof Tile, value: number) => {
    const newTiles = [...tiles];
    newTiles[index] = { ...newTiles[index], [field]: value };
    onChange(newTiles);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Tiles ({tiles.length})</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-7 px-2 text-xs"
        >
          + Add Tile
        </Button>
      </div>

      {tiles.length > 0 && (
        <>
          <div className="grid grid-cols-7 gap-2 px-2 text-xs text-muted-foreground font-medium">
            <div>ID</div>
            <div>Row</div>
            <div>Col</div>
            <div>Layer</div>
            <div>Ind</div>
            <div>Skin</div>
            <div></div>
          </div>
          <div className="space-y-1">
            {tiles.map((tile, index) => (
              <div key={index} className="grid grid-cols-7 gap-2 items-center">
                <Input
                  type="number"
                  value={tile.id}
                  onChange={(e) => handleChange(index, 'id', parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  step="0.5"
                  value={tile.row}
                  onChange={(e) => handleChange(index, 'row', parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  step="0.5"
                  value={tile.col}
                  onChange={(e) => handleChange(index, 'col', parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  value={tile.layer}
                  onChange={(e) => handleChange(index, 'layer', parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  value={tile.ind}
                  onChange={(e) => handleChange(index, 'ind', parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  value={tile.skin}
                  onChange={(e) => handleChange(index, 'skin', parseInt(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {tiles.length === 0 && (
        <div className="rounded border border-dashed border-border/50 bg-muted/10 p-3 text-center text-xs text-muted-foreground">
          No tiles added yet
        </div>
      )}
    </div>
  );
}

// ============================================
// LOAD BOARD STEP FORM
// ============================================

interface LoadBoardFormProps {
  data: LoadBoardData;
  onChange: (data: LoadBoardData) => void;
}

function LoadBoardForm({ data, onChange }: LoadBoardFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Level</Label>
          <Input
            type="number"
            min={1}
            value={data.Level}
            onChange={(e) => onChange({ ...data, Level: parseInt(e.target.value) || 1 })}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Adaptive</Label>
          <Input
            type="number"
            min={0}
            value={data.Adaptive}
            onChange={(e) => onChange({ ...data, Adaptive: parseInt(e.target.value) || 0 })}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Total Tiles</Label>
          <Input
            type="number"
            min={0}
            value={data.TotalTiles}
            onChange={(e) => onChange({ ...data, TotalTiles: parseInt(e.target.value) || 0 })}
            className="h-8"
          />
        </div>
        <div className="flex items-end space-x-2 pb-1">
          <Switch
            id="can-revive"
            checked={data.CanRevive}
            onCheckedChange={(checked) => onChange({ ...data, CanRevive: checked })}
          />
          <Label htmlFor="can-revive" className="text-xs">Can Revive</Label>
        </div>
      </div>

      <TileEditor
        tiles={data.Tiles || []}
        onChange={(tiles) => onChange({ ...data, Tiles: tiles })}
      />
    </div>
  );
}

// ============================================
// SHOW TOAST STEP FORM
// ============================================

interface ShowToastFormProps {
  data: ShowToastData;
  onChange: (data: ShowToastData) => void;
}

function ShowToastForm({ data, onChange }: ShowToastFormProps) {
  const updateToast = (field: string, value: any) => {
    onChange({
      ...data,
      Toast: { ...data.Toast, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Message Key</Label>
        <Input
          value={data.Toast.M}
          onChange={(e) => updateToast('M', e.target.value)}
          placeholder="e.g., TAP_3_TILES"
          className="h-8"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="space-y-1.5">
          <Label className="text-xs">Width (W)</Label>
          <Input
            type="number"
            step="0.01"
            value={data.Toast.W}
            onChange={(e) => updateToast('W', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Height (H)</Label>
          <Input
            type="number"
            step="0.01"
            value={data.Toast.H}
            onChange={(e) => updateToast('H', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">X Position</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={data.Toast.X}
            onChange={(e) => updateToast('X', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Y Position</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={data.Toast.Y}
            onChange={(e) => updateToast('Y', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Finish Step</Label>
          <Input
            type="number"
            min={0}
            value={data.FinishStep}
            onChange={(e) => onChange({ ...data, FinishStep: parseInt(e.target.value) || 0 })}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SHOW POPUP STEP FORM
// ============================================

interface ShowPopupFormProps {
  data: ShowPopupData;
  onChange: (data: ShowPopupData) => void;
}

function ShowPopupForm({ data, onChange }: ShowPopupFormProps) {
  const updatePopup = (field: string, value: any) => {
    onChange({
      ...data,
      Popup: { ...data.Popup, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">Message Key</Label>
        <Input
          value={data.Popup.M}
          onChange={(e) => updatePopup('M', e.target.value)}
          placeholder="e.g., WELCOME_MESSAGE"
          className="h-8"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="space-y-1.5">
          <Label className="text-xs">Width (W)</Label>
          <Input
            type="number"
            step="0.01"
            value={data.Popup.W}
            onChange={(e) => updatePopup('W', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Height (H)</Label>
          <Input
            type="number"
            step="0.01"
            value={data.Popup.H}
            onChange={(e) => updatePopup('H', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">X Position</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={data.Popup.X}
            onChange={(e) => updatePopup('X', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Y Position</Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={data.Popup.Y}
            onChange={(e) => updatePopup('Y', parseFloat(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Finish Step</Label>
          <Input
            type="number"
            min={0}
            value={data.FinishStep || 0}
            onChange={(e) => onChange({ ...data, FinishStep: parseInt(e.target.value) || undefined })}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// HINT TAP STEP FORM
// ============================================

interface HintTapFormProps {
  data: HintTapData;
  onChange: (data: HintTapData) => void;
}

function HintTapForm({ data, onChange }: HintTapFormProps) {
  const updateAdditionInfo = (field: string, value: any) => {
    onChange({
      ...data,
      AdditionInfo: { ...data.AdditionInfo, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Target Tile ID</Label>
          <Input
            type="number"
            min={0}
            value={data.TileId}
            onChange={(e) => onChange({ ...data, TileId: parseInt(e.target.value) || 0 })}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hand ID</Label>
          <Input
            type="number"
            min={0}
            value={data.AdditionInfo.HandId}
            onChange={(e) => updateAdditionInfo('HandId', parseInt(e.target.value) || 0)}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hand Animation</Label>
          <Input
            type="number"
            min={0}
            value={data.AdditionInfo.HandAnim}
            onChange={(e) => updateAdditionInfo('HandAnim', parseInt(e.target.value) || 0)}
            className="h-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Effects</Label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="flex items-center space-x-2">
            <Switch
              id="hand-moving"
              checked={data.AdditionInfo.HandMoving}
              onCheckedChange={(checked) => updateAdditionInfo('HandMoving', checked)}
            />
            <Label htmlFor="hand-moving" className="text-xs">Hand Moving</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="hand-auto-hide"
              checked={data.AdditionInfo.HandAutoHide}
              onCheckedChange={(checked) => updateAdditionInfo('HandAutoHide', checked)}
            />
            <Label htmlFor="hand-auto-hide" className="text-xs">Auto Hide</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="tap-effect"
              checked={data.AdditionInfo.TapEffect}
              onCheckedChange={(checked) => updateAdditionInfo('TapEffect', checked)}
            />
            <Label htmlFor="tap-effect" className="text-xs">Tap Effect</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="tile-glow"
              checked={data.AdditionInfo.TileGlow}
              onCheckedChange={(checked) => updateAdditionInfo('TileGlow', checked)}
            />
            <Label htmlFor="tile-glow" className="text-xs">Tile Glow</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="tile-hint-move"
              checked={data.AdditionInfo.TileHintMove}
              onCheckedChange={(checked) => updateAdditionInfo('TileHintMove', checked)}
            />
            <Label htmlFor="tile-hint-move" className="text-xs">Hint Move</Label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HINT POINT STEP FORM
// ============================================

interface HintPointFormProps {
  data: HintPointData;
  onChange: (data: HintPointData) => void;
}

function HintPointForm({ data, onChange }: HintPointFormProps) {
  const updateAdditionInfo = (field: string, value: any) => {
    onChange({
      ...data,
      AdditionInfo: { ...data.AdditionInfo, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Target Tile ID</Label>
          <Input
            type="number"
            min={0}
            value={data.TileId}
            onChange={(e) => onChange({ ...data, TileId: parseInt(e.target.value) || 0 })}
            className="h-8"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hand ID</Label>
          <Input
            type="number"
            min={0}
            value={data.AdditionInfo.HandId}
            onChange={(e) => updateAdditionInfo('HandId', parseInt(e.target.value) || 0)}
            className="h-8"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Effects</Label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="hand-auto-hide-point"
              checked={data.AdditionInfo.HandAutoHide}
              onCheckedChange={(checked) => updateAdditionInfo('HandAutoHide', checked)}
            />
            <Label htmlFor="hand-auto-hide-point" className="text-xs">Auto Hide</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="tap-effect-point"
              checked={data.AdditionInfo.TapEffect}
              onCheckedChange={(checked) => updateAdditionInfo('TapEffect', checked)}
            />
            <Label htmlFor="tap-effect-point" className="text-xs">Tap Effect</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="tile-glow-point"
              checked={data.AdditionInfo.TileGlow}
              onCheckedChange={(checked) => updateAdditionInfo('TileGlow', checked)}
            />
            <Label htmlFor="tile-glow-point" className="text-xs">Tile Glow</Label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN STEP EDITOR COMPONENT
// ============================================

interface StepEditorProps {
  step: TutorialStep;
  stepIndex: number;
  onChange: (step: TutorialStep) => void;
  onRemove: () => void;
  className?: string;
}

export function StepEditor({
  step,
  stepIndex,
  onChange,
  onRemove,
  className,
}: StepEditorProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const handleTypeChange = (newType: string) => {
    const type = parseInt(newType) as ETutorialStep;
    onChange({
      ...step,
      Type: type,
      Data: getDefaultStepData(type),
    });
  };

  const handleDataChange = (data: any) => {
    onChange({ ...step, Data: data });
  };

  const getStepSummary = (): string => {
    switch (step.Type) {
      case ETutorialStep.LoadBoard:
        return `${step.Data?.Tiles?.length || 0} tiles`;
      case ETutorialStep.ShowToast:
        return step.Data?.Toast?.M || 'No message';
      case ETutorialStep.ShowPopup:
        return step.Data?.Popup?.M || 'No message';
      case ETutorialStep.HintTap:
      case ETutorialStep.HintPoint:
        return `Tile #${step.Data?.TileId ?? 0}`;
      default:
        return '';
    }
  };

  const renderDataForm = () => {
    switch (step.Type) {
      case ETutorialStep.LoadBoard:
        return <LoadBoardForm data={step.Data as LoadBoardData} onChange={handleDataChange} />;
      case ETutorialStep.ShowToast:
        return <ShowToastForm data={step.Data as ShowToastData} onChange={handleDataChange} />;
      case ETutorialStep.ShowPopup:
        return <ShowPopupForm data={step.Data as ShowPopupData} onChange={handleDataChange} />;
      case ETutorialStep.HintTap:
        return <HintTapForm data={step.Data as HintTapData} onChange={handleDataChange} />;
      case ETutorialStep.HintPoint:
        return <HintPointForm data={step.Data as HintPointData} onChange={handleDataChange} />;
      default:
        return <div className="text-xs text-muted-foreground">Unknown step type</div>;
    }
  };

  return (
    <div className={cn('rounded-lg border border-border/50 bg-card', className)}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
        
        <button type="button" className="p-0.5">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <span className="text-lg">{STEP_TYPE_ICONS[step.Type]}</span>
        
        <span className="font-medium text-sm">
          Step {stepIndex + 1}: {STEP_TYPE_LABELS[step.Type]}
        </span>

        {!isExpanded && (
          <span className="text-xs text-muted-foreground ml-2">
            - {getStepSummary()}
          </span>
        )}

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/30 space-y-4">
          {/* Type and Focus */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-[200px] space-y-1.5">
              <Label className="text-xs">Step Type</Label>
              <Select
                value={step.Type.toString()}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STEP_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <span>{STEP_TYPE_ICONS[parseInt(value) as ETutorialStep]}</span>
                        <span>{label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-5">
              <Switch
                id={`focus-${stepIndex}`}
                checked={step.Focus}
                onCheckedChange={(checked) => onChange({ ...step, Focus: checked })}
              />
              <Label htmlFor={`focus-${stepIndex}`} className="text-xs">Focus (dim background)</Label>
            </div>
          </div>

          {/* Type-specific form */}
          <div className="rounded-md border border-border/30 bg-muted/10 p-3">
            {renderDataForm()}
          </div>
        </div>
      )}
    </div>
  );
}

