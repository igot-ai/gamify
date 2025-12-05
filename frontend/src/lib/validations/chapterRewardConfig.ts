import { z } from 'zod';

export const chapterRewardConfigSchema = z.object({
  undo: z.number().int().min(0, 'Undo reward must be 0 or greater'),
  hint: z.number().int().min(0, 'Hint reward must be 0 or greater'),
  shuffle: z.number().int().min(0, 'Shuffle reward must be 0 or greater'),
});

export type ChapterRewardConfig = z.infer<typeof chapterRewardConfigSchema>;

export const defaultChapterRewardConfig: ChapterRewardConfig = {
  undo: 0,
  hint: 0,
  shuffle: 0,
};

