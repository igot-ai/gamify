import { z } from 'zod';

// Vector2 type for X/Y coordinate pairs
const vector2Schema = z.object({
  x: z.number({ required_error: 'X value is required' }),
  y: z.number({ required_error: 'Y value is required' }),
});

// Game Logic Config subsection
const gameLogicConfigSchema = z.object({
  matchCount: z.number({ required_error: 'Match Count is required' }).int().min(1),
  countUndoTileRevive: z.number({ required_error: 'Count Undo Tile Revive is required' }).int().min(0),
  countShuffleTileRevive: z.number({ required_error: 'Count Shuffle Tile Revive is required' }).int().min(0),
  countSlotHolder: z.number({ required_error: 'Count Slot Holder is required' }).int().min(1),
  warningThreshold: z.number({ required_error: 'Warning Threshold is required' }).int().min(0),
});

// Combo subsection
const comboSchema = z.object({
  matchEffect: z.number({ required_error: 'Match Effect is required' }).int().min(0),
  maxNoMatch: z.number({ required_error: 'Max No Match is required' }).int().min(0),
});

// Grid View subsection
const gridViewSchema = z.object({
  tileSize: vector2Schema,
});

// Holder View subsection
const holderViewSchema = z.object({
  slotSize: vector2Schema,
  slotSpace: z.number({ required_error: 'Slot Space is required' }).min(0),
  ratioBetweenTwoTile: z.number({ required_error: 'Ratio Between Two Tile is required' }).min(0),
  slotYPadding: z.number({ required_error: 'Slot Y Padding is required' }).min(0),
  tileInHolderYPadding: z.number({ required_error: 'Tile In Holder Y Padding is required' }).min(0),
});

// Game Logic section (contains Game Logic Config + Combo)
const gameLogicSchema = z.object({
  gameLogicConfig: gameLogicConfigSchema,
  combo: comboSchema,
});

// View Config section (contains Grid View + Holder View)
const viewConfigSchema = z.object({
  gridView: gridViewSchema,
  holderView: holderViewSchema,
});

// Full Game Config
export const gameConfigSchema = z.object({
  gameLogic: gameLogicSchema,
  viewConfig: viewConfigSchema,
});

// Type exports
export type Vector2 = z.infer<typeof vector2Schema>;
export type GameLogicConfig = z.infer<typeof gameLogicConfigSchema>;
export type Combo = z.infer<typeof comboSchema>;
export type GridView = z.infer<typeof gridViewSchema>;
export type HolderView = z.infer<typeof holderViewSchema>;
export type GameLogic = z.infer<typeof gameLogicSchema>;
export type ViewConfig = z.infer<typeof viewConfigSchema>;
export type GameConfig = z.infer<typeof gameConfigSchema>;

