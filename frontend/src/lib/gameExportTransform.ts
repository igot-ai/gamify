/**
 * Transform internal GameConfig to Unity-compatible export format.
 */

import type { GameConfig } from './validations/gameConfig';

export interface ExportGameConfig {
  GameLogic: {
    GameLogicConfig: {
      MatchCount: number;
      CountUndoTileRevive: number;
      CountShuffleTileRevive: number;
      CountSlotHolder: number;
      WarningThreshold: number;
    };
    Combo: {
      MatchEffect: number;
      MaxNoMatch: number;
    };
  };
  ViewConfig: {
    GridView: {
      TileSize: { X: number; Y: number };
    };
    HolderView: {
      SlotSize: { X: number; Y: number };
      SlotSpace: number;
      RatioBetweenTwoTile: number;
      SlotYPadding: number;
      TileInHolderYPadding: number;
    };
  };
}

export function transformGameConfigToExport(config: GameConfig): ExportGameConfig {
  return {
    GameLogic: {
      GameLogicConfig: {
        MatchCount: config.gameLogic.gameLogicConfig.matchCount,
        CountUndoTileRevive: config.gameLogic.gameLogicConfig.countUndoTileRevive,
        CountShuffleTileRevive: config.gameLogic.gameLogicConfig.countShuffleTileRevive,
        CountSlotHolder: config.gameLogic.gameLogicConfig.countSlotHolder,
        WarningThreshold: config.gameLogic.gameLogicConfig.warningThreshold,
      },
      Combo: {
        MatchEffect: config.gameLogic.combo.matchEffect,
        MaxNoMatch: config.gameLogic.combo.maxNoMatch,
      },
    },
    ViewConfig: {
      GridView: {
        TileSize: { X: config.viewConfig.gridView.tileSize.x, Y: config.viewConfig.gridView.tileSize.y },
      },
      HolderView: {
        SlotSize: { X: config.viewConfig.holderView.slotSize.x, Y: config.viewConfig.holderView.slotSize.y },
        SlotSpace: config.viewConfig.holderView.slotSpace,
        RatioBetweenTwoTile: config.viewConfig.holderView.ratioBetweenTwoTile,
        SlotYPadding: config.viewConfig.holderView.slotYPadding,
        TileInHolderYPadding: config.viewConfig.holderView.tileInHolderYPadding,
      },
    },
  };
}

