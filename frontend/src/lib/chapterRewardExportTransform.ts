/**
 * Transform internal ChapterRewardConfig to Unity-compatible export format.
 */

import type { ChapterRewardConfig } from './validations/chapterRewardConfig';

export interface ExportChapterRewardConfig {
  Undo: number;
  Hint: number;
  Shuffle: number;
}

export function transformChapterRewardConfigToExport(config: ChapterRewardConfig): ExportChapterRewardConfig {
  if (!config) {
    return {
      Undo: 1,
      Hint: 1,
      Shuffle: 1,
    };
  }
  return {
    Undo: config.undo ?? 1,
    Hint: config.hint ?? 1,
    Shuffle: config.shuffle ?? 1,
  };
}

