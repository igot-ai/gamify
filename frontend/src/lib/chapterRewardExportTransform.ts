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
  return {
    Undo: config.undo,
    Hint: config.hint,
    Shuffle: config.shuffle,
  };
}

