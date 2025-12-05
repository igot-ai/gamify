import { z } from 'zod';

// ============================================
// TUTORIAL STEP TYPES ENUM
// ============================================

export enum ETutorialStep {
  LoadBoard = 0,
  ShowPopup = 1,
  ShowToast = 2,
  HintTap = 3,
  HintPoint = 4,
}

export const STEP_TYPE_LABELS: Record<ETutorialStep, string> = {
  [ETutorialStep.LoadBoard]: 'Load Board',
  [ETutorialStep.ShowPopup]: 'Show Popup',
  [ETutorialStep.ShowToast]: 'Show Toast',
  [ETutorialStep.HintTap]: 'Hint Tap',
  [ETutorialStep.HintPoint]: 'Hint Point',
};

export const STEP_TYPE_ICONS: Record<ETutorialStep, string> = {
  [ETutorialStep.LoadBoard]: '🎮',
  [ETutorialStep.ShowPopup]: '📢',
  [ETutorialStep.ShowToast]: '💬',
  [ETutorialStep.HintTap]: '👆',
  [ETutorialStep.HintPoint]: '👉',
};

// ============================================
// GRID TILE SCHEMA (for LoadBoard step)
// Format: [column, -row, skinId]
// ============================================

export const gridTileSchema = z.tuple([
  z.number(), // column
  z.number(), // -row (negative row)
  z.number().int().min(0), // skinId
]);

export type GridTile = z.infer<typeof gridTileSchema>;

// ============================================
// TOAST MODEL SCHEMA (for ShowToast step)
// ============================================

export const toastModelSchema = z.object({
  M: z.string().min(1, 'Message key is required'),
  W: z.number().positive('Width must be positive'),
  H: z.number().positive('Height must be positive'),
  X: z.number().min(0).max(1, 'X position must be between 0 and 1'),
  Y: z.number().min(0).max(1, 'Y position must be between 0 and 1'),
});

export type ToastModel = z.infer<typeof toastModelSchema>;

// ============================================
// HINT TAP INFO SCHEMA (for HintTap step)
// ============================================

export const hintTapInfoSchema = z.object({
  HandId: z.number().int().min(0, 'Hand ID must be 0 or greater'),
  HandAnim: z.number().int().min(0, 'Hand animation must be 0 or greater'),
  HandMoving: z.boolean(),
  HandAutoHide: z.boolean(),
  TapEffect: z.boolean(),
  TileGlow: z.boolean(),
  TileHintMove: z.boolean(),
});

export type HintTapInfo = z.infer<typeof hintTapInfoSchema>;

// ============================================
// HINT POINT INFO SCHEMA (for HintPoint step)
// ============================================

export const hintPointInfoSchema = z.object({
  HandId: z.number().int().min(0, 'Hand ID must be 0 or greater'),
  HandAutoHide: z.boolean(),
  TapEffect: z.boolean(),
  TileGlow: z.boolean(),
});

export type HintPointInfo = z.infer<typeof hintPointInfoSchema>;

// ============================================
// STEP DATA SCHEMAS (different for each step type)
// ============================================

// LoadBoard step data
export const loadBoardDataSchema = z.object({
  Level: z.number().int().min(1, 'Level must be at least 1'),
  Moves: z.number().int().min(0, 'Moves must be 0 or greater'),
  GridTiles: z.array(gridTileSchema),
  HolderTiles: z.array(z.number().int().min(0)), // Array of skinId integers
});

export type LoadBoardData = z.infer<typeof loadBoardDataSchema>;

// ShowPopup step data
export const showPopupDataSchema = z.object({
  Popup: z.object({
    M: z.string().min(1, 'Message key is required'),
    W: z.number().positive('Width must be positive'),
    H: z.number().positive('Height must be positive'),
    X: z.number().min(0).max(1, 'X position must be between 0 and 1'),
    Y: z.number().min(0).max(1, 'Y position must be between 0 and 1'),
  }),
  FinishStep: z.number().int().min(0, 'Finish step must be 0 or greater').optional(),
});

export type ShowPopupData = z.infer<typeof showPopupDataSchema>;

// ShowToast step data
export const showToastDataSchema = z.object({
  Toast: toastModelSchema,
  FinishStep: z.number().int().min(0, 'Finish step must be 0 or greater'),
});

export type ShowToastData = z.infer<typeof showToastDataSchema>;

// HintTap step data
export const hintTapDataSchema = z.object({
  TileId: z.number().int().min(0, 'Tile ID must be 0 or greater'),
  AdditionInfo: hintTapInfoSchema,
});

export type HintTapData = z.infer<typeof hintTapDataSchema>;

// HintPoint step data
export const hintPointDataSchema = z.object({
  TileId: z.number().int().min(0, 'Tile ID must be 0 or greater'),
  AdditionInfo: hintPointInfoSchema,
});

export type HintPointData = z.infer<typeof hintPointDataSchema>;

// ============================================
// TUTORIAL STEP SCHEMA
// ============================================

export const tutorialStepSchema = z.object({
  Type: z.nativeEnum(ETutorialStep),
  Data: z.any(), // Validated at runtime based on Type
  Focus: z.boolean(),
  _id: z.string().optional(), // Internal ID for React key (stripped on export)
});

export type TutorialStep = z.infer<typeof tutorialStepSchema>;

// Generate unique ID for steps
export const generateStepId = (): string => {
  return `step_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// ============================================
// TUTORIAL LEVEL SCHEMA
// ============================================

export const tutorialLevelSchema = z.object({
  Level: z.number().int().min(1, 'Level must be at least 1'),
  Steps: z.array(tutorialStepSchema),
});

export type TutorialLevel = z.infer<typeof tutorialLevelSchema>;

// ============================================
// TUTORIAL DATA SCHEMA (full tutorial content)
// ============================================

export const tutorialDataSchema = z.object({
  Id: z.string().min(1, 'Tutorial ID is required'),
  Levels: z.array(tutorialLevelSchema),
});

export type TutorialData = z.infer<typeof tutorialDataSchema>;

// ============================================
// TUTORIAL CONFIG SCHEMA (top-level config)
// ============================================

export const tutorialConfigSchema = z.object({
  option: z.number().int().min(1, 'Option must be at least 1'),
  data: tutorialDataSchema,
});

export type TutorialConfig = z.infer<typeof tutorialConfigSchema>;

// ============================================
// DEFAULT VALUES
// ============================================

export const defaultGridTile: GridTile = [0, 0, 0]; // [column, -row, skinId]

export const defaultToastModel: ToastModel = {
  M: '',
  W: 8.05,
  H: 2.23,
  X: 0.5,
  Y: 0.35,
};

export const defaultHintTapInfo: HintTapInfo = {
  HandId: 1,
  HandAnim: 1,
  HandMoving: true,
  HandAutoHide: false,
  TapEffect: false,
  TileGlow: true,
  TileHintMove: true,
};

export const defaultHintPointInfo: HintPointInfo = {
  HandId: 1,
  HandAutoHide: false,
  TapEffect: true,
  TileGlow: true,
};

export const defaultLoadBoardData: LoadBoardData = {
  Level: 1,
  Moves: 10,
  GridTiles: [],
  HolderTiles: [],
};

export const defaultShowPopupData: ShowPopupData = {
  Popup: {
    M: '',
    W: 8.05,
    H: 2.23,
    X: 0.5,
    Y: 0.5,
  },
};

export const defaultShowToastData: ShowToastData = {
  Toast: defaultToastModel,
  FinishStep: 0,
};

export const defaultHintTapData: HintTapData = {
  TileId: 0,
  AdditionInfo: defaultHintTapInfo,
};

export const defaultHintPointData: HintPointData = {
  TileId: 0,
  AdditionInfo: defaultHintPointInfo,
};

export const getDefaultStepData = (type: ETutorialStep): any => {
  switch (type) {
    case ETutorialStep.LoadBoard:
      return { ...defaultLoadBoardData };
    case ETutorialStep.ShowPopup:
      return { ...defaultShowPopupData };
    case ETutorialStep.ShowToast:
      return { ...defaultShowToastData };
    case ETutorialStep.HintTap:
      return { ...defaultHintTapData };
    case ETutorialStep.HintPoint:
      return { ...defaultHintPointData };
    default:
      return {};
  }
};

export const defaultTutorialStep: TutorialStep = {
  Type: ETutorialStep.LoadBoard,
  Data: defaultLoadBoardData,
  Focus: false,
  _id: '', // Will be generated when creating
};

export const defaultTutorialLevel: TutorialLevel = {
  Level: 1,
  Steps: [],
};

export const defaultTutorialData: TutorialData = {
  Id: '1',
  Levels: [],
};

export const defaultTutorialConfig: TutorialConfig = {
  option: 0,
  data: defaultTutorialData,
};

