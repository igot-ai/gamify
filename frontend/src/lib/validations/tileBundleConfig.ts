import { z } from 'zod';

export const tileBundleConfigSchema = z.object({
  enabled: z.boolean().default(true),
  discount: z.number({ required_error: 'Discount is required' }).int().min(0).max(100),
  minLevel: z.number({ required_error: 'Min Level is required' }).int().min(1),
  daysPlayedTrigger: z.number({ required_error: 'Days Played Trigger is required' }).int().min(0),
  sessionsPlayedTrigger: z.number({ required_error: 'Sessions Played Trigger is required' }).int().min(0),
  durationHours: z.number({ required_error: 'Duration Hours is required' }).min(0),
  maxLifetimeShows: z.number({ required_error: 'Max Lifetime Shows is required' }).int().min(1),
  maxSessionShows: z.number({ required_error: 'Max Session Shows is required' }).int().min(1),
  cooldownPopupHours: z.number({ required_error: 'Cooldown Popup Hours is required' }).min(0),
  cooldownOfferHours: z.number({ required_error: 'Cooldown Offer Hours is required' }).min(0),
});

export type TileBundleConfig = z.infer<typeof tileBundleConfigSchema>;

export const defaultTileBundleConfig: TileBundleConfig = {
  enabled: false,
  discount: 0,
  minLevel: 0,
  daysPlayedTrigger: 0,
  sessionsPlayedTrigger: 0,
  durationHours: 0,
  maxLifetimeShows: 0,
  maxSessionShows: 0,
  cooldownPopupHours: 0,
  cooldownOfferHours: 0,
};
