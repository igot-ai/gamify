import { z } from 'zod';

const versionRegex = /^\d+\.\d+\.\d+$/;

export const gameCoreConfigSchema = z.object({
  version: z
    .string()
    .min(1, 'Version is required')
    .regex(versionRegex, 'Version must be in format X.Y.Z (e.g., 1.0.0)'),
  build_number: z.number().int().min(1, 'Build number must be at least 1'),
  min_supported_version: z
    .string()
    .min(1, 'Min supported version is required')
    .regex(versionRegex, 'Min supported version must be in format X.Y.Z (e.g., 1.0.0)'),
  force_update: z.boolean(),
  maintenance_mode: z.boolean(),
  maintenance_message: z.string(),
});

export type GameCoreConfig = z.infer<typeof gameCoreConfigSchema>;

