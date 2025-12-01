import {
  gameConfigSchema,
  type GameConfig,
  type Vector2,
  type GameLogicConfig,
  type Combo,
  type GridView,
  type HolderView,
} from '../gameConfig';

describe('gameConfigSchema', () => {
  describe('Vector2 validation', () => {
    it('should accept valid x and y coordinates', () => {
      const validConfig: GameConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should reject missing x coordinate in tileSize', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { y: 1.39 }, // missing x
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('GameLogicConfig validation', () => {
    it('should accept valid game logic config values', () => {
      const validConfig: GameConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gameLogic.gameLogicConfig.matchCount).toBe(3);
        expect(result.data.gameLogic.gameLogicConfig.countUndoTileRevive).toBe(5);
        expect(result.data.gameLogic.gameLogicConfig.countShuffleTileRevive).toBe(1);
        expect(result.data.gameLogic.gameLogicConfig.countSlotHolder).toBe(7);
        expect(result.data.gameLogic.gameLogicConfig.warningThreshold).toBe(5);
      }
    });

    it('should reject matchCount less than 1', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 0, // invalid: min is 1
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject negative countUndoTileRevive', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: -1, // invalid: min is 0
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject countSlotHolder less than 1', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 0, // invalid: min is 1
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Combo validation', () => {
    it('should accept valid combo values', () => {
      const validConfig: GameConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gameLogic.combo.matchEffect).toBe(5);
        expect(result.data.gameLogic.combo.maxNoMatch).toBe(4);
      }
    });

    it('should reject negative matchEffect', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: -1, // invalid: min is 0
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('ViewConfig validation', () => {
    it('should accept valid view config values', () => {
      const validConfig: GameConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.viewConfig.gridView.tileSize.x).toBe(1.46);
        expect(result.data.viewConfig.gridView.tileSize.y).toBe(1.39);
        expect(result.data.viewConfig.holderView.slotSize.x).toBe(1.44);
        expect(result.data.viewConfig.holderView.slotSize.y).toBe(1.34);
        expect(result.data.viewConfig.holderView.slotSpace).toBe(0);
        expect(result.data.viewConfig.holderView.ratioBetweenTwoTile).toBe(0.9358974);
        expect(result.data.viewConfig.holderView.slotYPadding).toBe(0.027);
        expect(result.data.viewConfig.holderView.tileInHolderYPadding).toBe(0.102);
      }
    });

    it('should reject negative slotSpace', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: -1, // invalid: min is 0
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject negative ratioBetweenTwoTile', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: -0.5, // invalid: min is 0
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Missing required fields', () => {
    it('should reject missing gameLogic', () => {
      const invalidConfig = {
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject missing viewConfig', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should reject missing combo in gameLogic', () => {
      const invalidConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          // missing combo
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.46, y: 1.39 },
          },
          holderView: {
            slotSize: { x: 1.44, y: 1.34 },
            slotSpace: 0,
            ratioBetweenTwoTile: 0.9358974,
            slotYPadding: 0.027,
            tileInHolderYPadding: 0.102,
          },
        },
      };

      const result = gameConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('Float values for view config', () => {
    it('should accept decimal values for all float fields', () => {
      const validConfig: GameConfig = {
        gameLogic: {
          gameLogicConfig: {
            matchCount: 3,
            countUndoTileRevive: 5,
            countShuffleTileRevive: 1,
            countSlotHolder: 7,
            warningThreshold: 5,
          },
          combo: {
            matchEffect: 5,
            maxNoMatch: 4,
          },
        },
        viewConfig: {
          gridView: {
            tileSize: { x: 1.456789, y: 1.392345 },
          },
          holderView: {
            slotSize: { x: 1.44321, y: 1.34567 },
            slotSpace: 0.5,
            ratioBetweenTwoTile: 0.9358974123456,
            slotYPadding: 0.02789,
            tileInHolderYPadding: 0.10234,
          },
        },
      };

      const result = gameConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.viewConfig.gridView.tileSize.x).toBe(1.456789);
        expect(result.data.viewConfig.holderView.ratioBetweenTwoTile).toBe(0.9358974123456);
      }
    });
  });
});

