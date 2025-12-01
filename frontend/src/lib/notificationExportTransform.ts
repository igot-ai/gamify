/**
 * Transform internal NotificationConfig to Unity-compatible export format.
 * 
 * This transforms camelCase internal structure to PascalCase Unity format.
 */

import type { NotificationConfig } from './validations/notificationConfig';

// ============================================
// EXPORT FORMAT TYPES
// ============================================

export interface ExportNotificationMessage {
  Title: string;
  Body: string;
  Payload: string;
  AndroidChannelId: string;
  IosCategory: string;
  OffsetSeconds: number;
}

export interface ExportNotificationStrategy {
  Id: string;
  Name: string;
  Mode: number;
  DelaySeconds: number;
  FixedHour: number;
  FixedMinute: number;
  FixedDaysOffset: number;
  RepeatPolicy: number;
  RepeatSeconds: number;
  Active: boolean;
  AutoScheduled: boolean;
  SchedulingMode: number;
  DefaultChannelId: string;
  Notifications: ExportNotificationMessage[];
}

export interface ExportNotificationChannel {
  Id: string;
  Name: string;
  Description: string;
  DefaultBadge: number;
  Importance: number;
  EnableLights: boolean;
  EnableVibration: boolean;
  CanBypassDnd: boolean;
  CanShowBadge: boolean;
  LockScreenVisibility: number;
}

export interface ExportNotificationConfig {
  Enable: boolean;
  Strategies: ExportNotificationStrategy[];
  Channels: ExportNotificationChannel[];
}

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

/**
 * Transform internal NotificationConfig to Unity-compatible export format.
 */
export function transformNotificationConfigToExport(config: NotificationConfig): ExportNotificationConfig {
  return {
    Enable: config.enable,
    Strategies: transformStrategies(config.strategies),
    Channels: transformChannels(config.channels),
  };
}

function transformStrategies(strategies: NotificationConfig['strategies']): ExportNotificationStrategy[] {
  return strategies.map((strategy) => ({
    Id: strategy.id,
    Name: strategy.name,
    Mode: strategy.mode,
    DelaySeconds: strategy.delaySeconds,
    FixedHour: strategy.fixedHour,
    FixedMinute: strategy.fixedMinute,
    FixedDaysOffset: strategy.fixedDaysOffset,
    RepeatPolicy: strategy.repeatPolicy,
    RepeatSeconds: strategy.repeatSeconds,
    Active: strategy.active,
    AutoScheduled: strategy.autoScheduled,
    SchedulingMode: strategy.schedulingMode,
    DefaultChannelId: strategy.defaultChannelId,
    Notifications: transformMessages(strategy.notifications),
  }));
}

function transformMessages(messages: NotificationConfig['strategies'][0]['notifications']): ExportNotificationMessage[] {
  return messages.map((message) => ({
    Title: message.title,
    Body: message.body,
    Payload: message.payload,
    AndroidChannelId: message.androidChannelId,
    IosCategory: message.iosCategory,
    OffsetSeconds: message.offsetSeconds,
  }));
}

function transformChannels(channels: NotificationConfig['channels']): ExportNotificationChannel[] {
  return channels.map((channel) => ({
    Id: channel.id,
    Name: channel.name,
    Description: channel.description,
    DefaultBadge: channel.defaultBadge,
    Importance: channel.importance,
    EnableLights: channel.enableLights,
    EnableVibration: channel.enableVibration,
    CanBypassDnd: channel.canBypassDnd,
    CanShowBadge: channel.canShowBadge,
    LockScreenVisibility: channel.lockScreenVisibility,
  }));
}

