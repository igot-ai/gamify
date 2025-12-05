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

const DEFAULT_HAPTIC_TYPE: ExportHapticType = {
  Android: { Duration: 50, Amplitude: 100 },
  IOS: { Intensity: 0.5, Sharpness: 0.5, Duration: 0.1 },
};

function transformHapticType(haptic?: HapticType): ExportHapticType {
  if (!haptic) return DEFAULT_HAPTIC_TYPE;
  return {
    Android: {
      Duration: haptic.android?.duration ?? 50,
      Amplitude: haptic.android?.amplitude ?? 100,
    },
    IOS: {
      Intensity: haptic.ios?.intensity ?? 0.5,
      Sharpness: haptic.ios?.sharpness ?? 0.5,
      Duration: haptic.ios?.duration ?? 0.1,
    },
  };
}

export function transformHapticConfigToExport(config: HapticConfig): ExportHapticConfig {
  if (!config) {
    return {
      Soft: DEFAULT_HAPTIC_TYPE,
      Light: DEFAULT_HAPTIC_TYPE,
      Medium: DEFAULT_HAPTIC_TYPE,
      Heavy: DEFAULT_HAPTIC_TYPE,
      Button: DEFAULT_HAPTIC_TYPE,
      Success: DEFAULT_HAPTIC_TYPE,
      Error: DEFAULT_HAPTIC_TYPE,
    };
  }
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

