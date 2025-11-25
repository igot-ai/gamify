import { z } from 'zod';

// Platform-specific haptic settings
const androidHapticSchema = z.object({
  duration: z.number().int().min(0, 'Duration must be 0 or greater'),
  amplitude: z.number().int().min(0, 'Amplitude must be 0 or greater').max(255, 'Amplitude cannot exceed 255'),
});

const iosHapticSchema = z.object({
  intensity: z.number().min(0, 'Intensity must be 0 or greater').max(1, 'Intensity cannot exceed 1'),
  sharpness: z.number().min(0, 'Sharpness must be 0 or greater').max(1, 'Sharpness cannot exceed 1'),
  duration: z.number().min(0, 'Duration must be 0 or greater'),
});

// Haptic type schema
const hapticTypeSchema = z.object({
  android: androidHapticSchema,
  ios: iosHapticSchema,
});

export const hapticConfigSchema = z.object({
  soft: hapticTypeSchema,
  light: hapticTypeSchema,
  medium: hapticTypeSchema,
  heavy: hapticTypeSchema,
  button: hapticTypeSchema,
  success: hapticTypeSchema,
  error: hapticTypeSchema,
});

export type AndroidHaptic = z.infer<typeof androidHapticSchema>;
export type IosHaptic = z.infer<typeof iosHapticSchema>;
export type HapticType = z.infer<typeof hapticTypeSchema>;
export type HapticConfig = z.infer<typeof hapticConfigSchema>;

