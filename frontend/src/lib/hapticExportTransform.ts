/**
 * Transform internal HapticConfig to Unity-compatible export format.
 */

import type { HapticConfig, HapticType } from './validations/hapticConfig';

export interface ExportHapticType {
  Android: {
    Duration: number;
    Amplitude: number;
  };
  IOS: {
    Intensity: number;
    Sharpness: number;
    Duration: number;
  };
}

export interface ExportHapticConfig {
  Soft: ExportHapticType;
  Light: ExportHapticType;
  Medium: ExportHapticType;
  Heavy: ExportHapticType;
  Button: ExportHapticType;
  Success: ExportHapticType;
  Error: ExportHapticType;
}

function transformHapticType(haptic: HapticType): ExportHapticType {
  return {
    Android: {
      Duration: haptic.android.duration,
      Amplitude: haptic.android.amplitude,
    },
    IOS: {
      Intensity: haptic.ios.intensity,
      Sharpness: haptic.ios.sharpness,
      Duration: haptic.ios.duration,
    },
  };
}

export function transformHapticConfigToExport(config: HapticConfig): ExportHapticConfig {
  return {
    Soft: transformHapticType(config.soft),
    Light: transformHapticType(config.light),
    Medium: transformHapticType(config.medium),
    Heavy: transformHapticType(config.heavy),
    Button: transformHapticType(config.button),
    Success: transformHapticType(config.success),
    Error: transformHapticType(config.error),
  };
}

