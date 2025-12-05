/**
 * Transform internal TutorialConfig to Unity-compatible export format.
 */

import type { TutorialConfig, TutorialData, TutorialLevel, TutorialStep, GridTile } from './validations/tutorialConfig';

// ============================================
// EXPORT INTERFACES (Unity format - PascalCase)
// ============================================

// GridTile is exported as [column, -row, skinId] array
export type ExportGridTile = [number, number, number];

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
  Moves: number;
  GridTiles: ExportGridTile[];
  HolderTiles: number[];
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

function transformGridTile(tile: GridTile): ExportGridTile {
  // GridTile is already in [column, -row, skinId] format
  return [tile[0], tile[1], tile[2]];
}

function transformStepData(type: number, data: any): any {
  // Data is already in the correct format (PascalCase from the schema)
  // Just ensure grid tiles are properly transformed for LoadBoard
  if (type === 0 && data.GridTiles) {
    return {
      Level: data.Level,
      Moves: data.Moves,
      GridTiles: data.GridTiles.map(transformGridTile),
      HolderTiles: data.HolderTiles || [],
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
 * Returns the full tutorial config including data.
 */
export function transformTutorialConfigToExport(config: TutorialConfig): { Option: number; Data: ExportTutorialData } {
  if (!config) {
    return {
      Option: 1,
      Data: { Id: '1', Levels: [] },
    };
  }
  return {
    Option: config.option ?? 1,
    Data: config.data ? transformTutorialData(config.data) : { Id: '1', Levels: [] },
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

