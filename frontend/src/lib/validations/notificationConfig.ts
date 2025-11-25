import { z } from 'zod';

// Notification Mode enum
export const NotificationModeEnum = z.enum(['0', '1']); // DELAY = 0, FIXED_TIME = 1

// Repeat Policy enum
export const RepeatPolicyEnum = z.enum(['0', '2']); // NO_REPEAT = 0, DAILY = 2

// Scheduling Mode enum
export const SchedulingModeEnum = z.enum(['0', '1']); // RANDOM = 0, SEQUENTIAL = 1

// Notification Message schema
export const notificationMessageSchema = z.object({
  Title: z.string().min(1, 'Title is required'),
  Body: z.string().min(1, 'Body is required'),
  Payload: z.string().default(''),
  AndroidChannelId: z.string().default(''),
  IosCategory: z.string().default(''),
  OffsetSeconds: z.number().int().min(0).default(0),
});

// Notification Strategy schema
export const notificationStrategySchema = z.object({
  Id: z.string().min(1, 'Strategy ID is required'),
  Name: z.string().min(1, 'Strategy name is required'),
  Mode: NotificationModeEnum,
  DelaySeconds: z.number().int().min(0).default(0),
  FixedHour: z.number().int().min(0).max(23).default(0),
  FixedMinute: z.number().int().min(0).max(59).default(0),
  FixedDaysOffset: z.number().int().min(0).default(0),
  RepeatPolicy: RepeatPolicyEnum,
  RepeatSeconds: z.number().int().min(0).default(0),
  Active: z.boolean().default(true),
  AutoScheduled: z.boolean().default(true),
  SchedulingMode: SchedulingModeEnum,
  DefaultChannelId: z.string().min(1, 'Default channel ID is required'),
  Notifications: z.array(notificationMessageSchema).min(1, 'At least one notification is required'),
});

// Notification Channel schema
export const notificationChannelSchema = z.object({
  Id: z.string().min(1, 'Channel ID is required'),
  Name: z.string().min(1, 'Channel name is required'),
  Description: z.string().default(''),
  DefaultBadge: z.number().int().min(0).default(1),
  Importance: z.number().int().min(0).max(5).default(3),
  EnableLights: z.boolean().default(true),
  EnableVibration: z.boolean().default(true),
  CanBypassDnd: z.boolean().default(false),
  CanShowBadge: z.boolean().default(true),
  LockScreenVisibility: z.number().int().min(-1).max(1).default(0),
});

// Notification Config schema
export const notificationConfigSchema = z
  .object({
    Enable: z.boolean().default(true),
    Strategies: z.array(notificationStrategySchema).default([]),
    Channels: z.array(notificationChannelSchema).min(1, 'At least one channel is required'),
  })
  .refine(
    (data) => {
      const ids = data.Strategies.map((s) => s.Id);
      return ids.length === new Set(ids).size;
    },
    {
      message: 'Strategy IDs must be unique',
      path: ['Strategies'],
    }
  )
  .refine(
    (data) => {
      const ids = data.Channels.map((c) => c.Id);
      return ids.length === new Set(ids).size;
    },
    {
      message: 'Channel IDs must be unique',
      path: ['Channels'],
    }
  );

export type NotificationMessage = z.infer<typeof notificationMessageSchema>;
export type NotificationStrategy = z.infer<typeof notificationStrategySchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type NotificationConfig = z.infer<typeof notificationConfigSchema>;

