import { z } from 'zod';

// Notification Mode enum (0 = DELAY, 1 = FIXED_TIME)
export const NotificationModeEnum = z.union([z.literal(0), z.literal(1)]);
export type NotificationMode = z.infer<typeof NotificationModeEnum>;

// Repeat Policy enum (0 = NO_REPEAT, 2 = DAILY)
export const RepeatPolicyEnum = z.union([z.literal(0), z.literal(2)]);
export type RepeatPolicy = z.infer<typeof RepeatPolicyEnum>;

// Scheduling Mode enum (0 = RANDOM, 1 = SEQUENTIAL)
export const SchedulingModeEnum = z.union([z.literal(0), z.literal(1)]);
export type SchedulingMode = z.infer<typeof SchedulingModeEnum>;

// Notification Message schema
export const notificationMessageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  payload: z.string().default(''),
  androidChannelId: z.string().default(''),
  iosCategory: z.string().default(''),
  offsetSeconds: z.number().int().min(0).default(0),
});

// Notification Strategy schema
export const notificationStrategySchema = z.object({
  id: z.string().min(1, 'Strategy ID is required'),
  name: z.string().min(1, 'Strategy name is required'),
  mode: NotificationModeEnum,
  delaySeconds: z.number().int().min(0).default(0),
  fixedHour: z.number().int().min(0).max(23).default(0),
  fixedMinute: z.number().int().min(0).max(59).default(0),
  fixedDaysOffset: z.number().int().min(0).default(0),
  repeatPolicy: RepeatPolicyEnum,
  repeatSeconds: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  autoScheduled: z.boolean().default(true),
  schedulingMode: SchedulingModeEnum,
  defaultChannelId: z.string().min(1, 'Default channel ID is required'),
  notifications: z.array(notificationMessageSchema).min(1, 'At least one notification is required'),
});

// Notification Channel schema
export const notificationChannelSchema = z.object({
  id: z.string().min(1, 'Channel ID is required'),
  name: z.string().min(1, 'Channel name is required'),
  description: z.string().default(''),
  defaultBadge: z.number().int().min(0).default(1),
  importance: z.number().int().min(0).max(5).default(3),
  enableLights: z.boolean().default(true),
  enableVibration: z.boolean().default(true),
  canBypassDnd: z.boolean().default(false),
  canShowBadge: z.boolean().default(true),
  lockScreenVisibility: z.number().int().min(-1).max(1).default(0),
});

// Notification Config schema
export const notificationConfigSchema = z
  .object({
    enable: z.boolean().default(true),
    strategies: z.array(notificationStrategySchema).default([]),
    channels: z.array(notificationChannelSchema).min(1, 'At least one channel is required'),
  })
  .refine(
    (data) => {
      const ids = data.strategies.map((s) => s.id);
      return ids.length === new Set(ids).size;
    },
    {
      message: 'Strategy IDs must be unique',
      path: ['strategies'],
    }
  )
  .refine(
    (data) => {
      const ids = data.channels.map((c) => c.id);
      return ids.length === new Set(ids).size;
    },
    {
      message: 'Channel IDs must be unique',
      path: ['channels'],
    }
  );

export type NotificationMessage = z.infer<typeof notificationMessageSchema>;
export type NotificationStrategy = z.infer<typeof notificationStrategySchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type NotificationConfig = z.infer<typeof notificationConfigSchema>;

// Default notification message
export const defaultMessage: NotificationMessage = {
  title: '',
  body: '',
  payload: '',
  androidChannelId: '',
  iosCategory: '',
  offsetSeconds: 0,
};

// Default notification channel
export const defaultChannel: NotificationChannel = {
  id: '',
  name: '',
  description: '',
  defaultBadge: 0,
  importance: 0,
  enableLights: false,
  enableVibration: false,
  canBypassDnd: false,
  canShowBadge: false,
  lockScreenVisibility: 0,
};

// Default notification strategy
export const defaultStrategy: NotificationStrategy = {
  id: '',
  name: '',
  mode: 0,
  delaySeconds: 0,
  fixedHour: 0,
  fixedMinute: 0,
  fixedDaysOffset: 0,
  repeatPolicy: 0,
  repeatSeconds: 0,
  active: false,
  autoScheduled: false,
  schedulingMode: 0,
  defaultChannelId: '',
  notifications: [],
};

// Default notification config
export const defaultNotificationConfig: NotificationConfig = {
  enable: false,
  strategies: [],
  channels: [],
};
