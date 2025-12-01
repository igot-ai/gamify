import { z } from 'zod';

export const linkConfigSchema = z.object({
  privacy_link: z.string().url('Must be a valid URL'),
  terms_link: z.string().url('Must be a valid URL'),
});

export type LinkConfig = z.infer<typeof linkConfigSchema>;

