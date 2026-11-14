import { defineApplication, FieldType } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import {
  DEFAULT_PARALLEL_REQUESTS,
  PARALLEL_REQUESTS_ENV_VAR_NAME,
  SCAVIO_API_KEY_ENV_VAR_NAME,
} from 'src/scavio/constants';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  author: 'Scavio',
  category: 'Enrichment',
  logo: 'public/logo.png',
  websiteUrl: 'https://scavio.dev/docs/company-enrich?via=twenty',
  termsUrl: 'https://scavio.dev/terms',
  emailSupport: 'hello@scavio.dev',
  issueReportUrl: 'https://github.com/scavio-ai/twenty-scavio/issues',
  billing: {
    description:
      'Free app. Needs a Scavio account: 10 Scavio credits per enriched company, unreachable sites are free. 50 free credits on signup.',
  },
  applicationVariables: {
    [SCAVIO_API_KEY_ENV_VAR_NAME]: {
      universalIdentifier: APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS.apiKey,
      label: 'Scavio API key',
      description:
        'Your key from https://dashboard.scavio.dev. Enrichment is billed to this Scavio account.',
      isSecret: true,
      isRequired: true,
    },
    [PARALLEL_REQUESTS_ENV_VAR_NAME]: {
      universalIdentifier:
        APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS.parallelRequests,
      label: 'Companies enriched at the same time',
      description:
        'How many companies are enriched in parallel (1-10). Keep 1 on the free Scavio plan; paid plans allow more.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: DEFAULT_PARALLEL_REQUESTS,
    },
  },
});
