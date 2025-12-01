/**
 * Transform internal LinkConfig to Unity-compatible export format.
 */

import type { LinkConfig } from './validations/linkConfig';

export interface ExportLinkConfig {
  PrivacyLink: string;
  TermsLink: string;
}

export function transformLinkConfigToExport(config: LinkConfig): ExportLinkConfig {
  return {
    PrivacyLink: config.privacy_link,
    TermsLink: config.terms_link,
  };
}

