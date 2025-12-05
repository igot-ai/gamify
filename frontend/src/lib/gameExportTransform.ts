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
  // Handle empty or undefined config
  if (!config || !config.gameLogic || !config.viewConfig) {
    return {
      GameLogic: {
        GameLogicConfig: {
          MatchCount: 3,
          CountUndoTileRevive: 1,
          CountShuffleTileRevive: 1,
          CountSlotHolder: 7,
          WarningThreshold: 5,
        },
        Combo: {
          MatchEffect: 3,
          MaxNoMatch: 5,
        },
      },
      ViewConfig: {
        GridView: {
          TileSize: { X: 1, Y: 1 },
        },
        HolderView: {
          SlotSize: { X: 1, Y: 1 },
          SlotSpace: 0.1,
          RatioBetweenTwoTile: 0.5,
          SlotYPadding: 0,
          TileInHolderYPadding: 0,
        },
      },
    };
  }

  return {
    GameLogic: {
      GameLogicConfig: {
        MatchCount: config.gameLogic.gameLogicConfig?.matchCount ?? 3,
        CountUndoTileRevive: config.gameLogic.gameLogicConfig?.countUndoTileRevive ?? 1,
        CountShuffleTileRevive: config.gameLogic.gameLogicConfig?.countShuffleTileRevive ?? 1,
        CountSlotHolder: config.gameLogic.gameLogicConfig?.countSlotHolder ?? 7,
        WarningThreshold: config.gameLogic.gameLogicConfig?.warningThreshold ?? 5,
      },
      Combo: {
        MatchEffect: config.gameLogic.combo?.matchEffect ?? 3,
        MaxNoMatch: config.gameLogic.combo?.maxNoMatch ?? 5,
      },
    },
    ViewConfig: {
      GridView: {
        TileSize: { 
          X: config.viewConfig.gridView?.tileSize?.x ?? 1, 
          Y: config.viewConfig.gridView?.tileSize?.y ?? 1 
        },
      },
      HolderView: {
        SlotSize: { 
          X: config.viewConfig.holderView?.slotSize?.x ?? 1, 
          Y: config.viewConfig.holderView?.slotSize?.y ?? 1 
        },
        SlotSpace: config.viewConfig.holderView?.slotSpace ?? 0.1,
        RatioBetweenTwoTile: config.viewConfig.holderView?.ratioBetweenTwoTile ?? 0.5,
        SlotYPadding: config.viewConfig.holderView?.slotYPadding ?? 0,
        TileInHolderYPadding: config.viewConfig.holderView?.tileInHolderYPadding ?? 0,
      },
    },
  };
}

