import { z } from 'zod';

// Android haptic settings
const androidHapticSchema = z.object({
  duration: z.number({ required_error: 'Duration is required' }).int().min(0),
  amplitude: z.number({ required_error: 'Amplitude is required' }).int().min(0).max(255),
});

// iOS haptic settings
const iosHapticSchema = z.object({
  intensity: z.number({ required_error: 'Intensity is required' }).min(0).max(1),
  sharpness: z.number({ required_error: 'Sharpness is required' }).min(0).max(1),
  duration: z.number({ required_error: 'Duration is required' }).min(0),
});

// Haptic type (contains both Android and iOS settings)
const hapticTypeSchema = z.object({
  android: androidHapticSchema,
  ios: iosHapticSchema,
});

// Full haptic config
export const hapticConfigSchema = z.object({
  soft: hapticTypeSchema,
  light: hapticTypeSchema,
  medium: hapticTypeSchema,
  heavy: hapticTypeSchema,
  button: hapticTypeSchema,
  success: hapticTypeSchema,
  error: hapticTypeSchema,
});

// Type exports
export type AndroidHaptic = z.infer<typeof androidHapticSchema>;
export type IOSHaptic = z.infer<typeof iosHapticSchema>;
export type HapticType = z.infer<typeof hapticTypeSchema>;
export type HapticConfig = z.infer<typeof hapticConfigSchema>;

const defaultHapticType: HapticType = {
  android: { duration: 0, amplitude: 0 },
  ios: { intensity: 0, sharpness: 0, duration: 0 },
};

export const defaultHapticConfig: HapticConfig = {
  soft: { ...defaultHapticType },
  light: { ...defaultHapticType },
  medium: { ...defaultHapticType },
  heavy: { ...defaultHapticType },
  button: { ...defaultHapticType },
  success: { ...defaultHapticType },
  error: { ...defaultHapticType },
};
