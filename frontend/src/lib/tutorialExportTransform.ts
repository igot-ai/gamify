/**
 * Transform internal TutorialConfig to Unity-compatible export format.
 */

import type { TutorialConfig, TutorialData, TutorialLevel, TutorialStep, Tile } from './validations/tutorialConfig';

// ============================================
// EXPORT INTERFACES (Unity format - PascalCase)
// ============================================

export interface ExportTile {
  id: number;
  row: number;
  col: number;
  layer: number;
  ind: number;
  skin: number;
}

export interface ExportToastModel {
  M: string;
  W: number;
  H: number;
  X: number;
  Y: number;
}

export interface ExportHintTapInfo {
  HandId: number;
  HandAnim: number;
  HandMoving: boolean;
  HandAutoHide: boolean;
  TapEffect: boolean;
  TileGlow: boolean;
  TileHintMove: boolean;
}

export interface ExportHintPointInfo {
  HandId: number;
  HandAutoHide: boolean;
  TapEffect: boolean;
  TileGlow: boolean;
}

export interface ExportLoadBoardData {
  Level: number;
  Adaptive: number;
  Tiles: ExportTile[];
  HolderTiles: any[];
  CanRevive: boolean;
  TotalTiles: number;
}

export interface ExportShowToastData {
  Toast: ExportToastModel;
  FinishStep: number;
}

export interface ExportShowPopupData {
  Popup: ExportToastModel;
  FinishStep?: number;
}

export interface ExportHintTapData {
  TileId: number;
  AdditionInfo: ExportHintTapInfo;
}

export interface ExportHintPointData {
  TileId: number;
  AdditionInfo: ExportHintPointInfo;
}

export interface ExportTutorialStep {
  Type: number;
  Data: any;
  Focus: boolean;
}

export interface ExportTutorialLevel {
  Level: number;
  Steps: ExportTutorialStep[];
}

export interface ExportTutorialData {
  Id: string;
  Levels: ExportTutorialLevel[];
}

export interface ExportTutorialConfig {
  Option: number;
}

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

function transformTile(tile: Tile): ExportTile {
  return {
    id: tile.id,
    row: tile.row,
    col: tile.col,
    layer: tile.layer,
    ind: tile.ind,
    skin: tile.skin,
  };
}

function transformStepData(type: number, data: any): any {
  // Data is already in the correct format (PascalCase from the schema)
  // Just ensure tiles are properly transformed for LoadBoard
  if (type === 0 && data.Tiles) {
    return {
      ...data,
      Tiles: data.Tiles.map(transformTile),
    };
  }
  return data;
}

function transformStep(step: TutorialStep): ExportTutorialStep {
  return {
    Type: step.Type,
    Data: transformStepData(step.Type, step.Data),
    Focus: step.Focus,
  };
}

function transformLevel(level: TutorialLevel): ExportTutorialLevel {
  return {
    Level: level.Level,
    Steps: level.Steps.map(transformStep),
  };
}

function transformTutorialData(data: TutorialData): ExportTutorialData {
  return {
    Id: data.Id,
    Levels: data.Levels.map(transformLevel),
  };
}

/**
 * Transform TutorialConfig to Unity-compatible export format.
 * Returns just the Option config that selects which tutorial to use.
 */
export function transformTutorialConfigToExport(config: TutorialConfig): ExportTutorialConfig {
  return {
    Option: config.option,
  };
}

/**
 * Transform TutorialConfig to full tutorial data export format.
 * This is the complete tutorial data structure for the Option_X.json files.
 */
export function transformTutorialDataToExport(config: TutorialConfig): ExportTutorialData {
  return transformTutorialData(config.data);
}

/**
 * Combined export that includes both the config option and full data.
 * This can be used when you need both pieces of information.
 */
export function transformTutorialFullExport(config: TutorialConfig): {
  config: ExportTutorialConfig;
  data: ExportTutorialData;
} {
  return {
    config: transformTutorialConfigToExport(config),
    data: transformTutorialDataToExport(config),
  };
}

