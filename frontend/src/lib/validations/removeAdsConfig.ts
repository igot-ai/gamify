import { z } from 'zod';

export const removeAdsConfigSchema = z.object({
  enabled: z.boolean().default(true),
  minLevel: z.number({ required_error: 'Min Level is required' }).int().min(1),
  adWatchedTrigger: z.number({ required_error: 'Ad Watched Trigger is required' }).int().min(0),
  daysPlayedTrigger: z.number({ required_error: 'Days Played Trigger is required' }).int().min(0),
  durationHours: z.number({ required_error: 'Duration Hours is required' }).int().min(1),
  maxLifetimeShows: z.number({ required_error: 'Max Lifetime Shows is required' }).int().min(1),
  maxSessionShows: z.number({ required_error: 'Max Session Shows is required' }).int().min(1),
  cooldownPopupHours: z.number({ required_error: 'Cooldown Popup Hours is required' }).int().min(0),
  cooldownOfferHours: z.number({ required_error: 'Cooldown Offer Hours is required' }).int().min(0),
});

export type RemoveAdsConfig = z.infer<typeof removeAdsConfigSchema>;

export const defaultRemoveAdsConfig: RemoveAdsConfig = {
  enabled: false,
  minLevel: 0,
  adWatchedTrigger: 0,
  daysPlayedTrigger: 0,
  durationHours: 0,
  maxLifetimeShows: 0,
  maxSessionShows: 0,
  cooldownPopupHours: 0,
  cooldownOfferHours: 0,
};
