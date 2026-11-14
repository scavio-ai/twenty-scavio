import { defineHealthCheck } from 'twenty-sdk/define';

import { HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { checkApiKey } from 'src/scavio/client';
import { getApiKey } from 'src/scavio/settings';
import { buildHealthResult } from 'src/scavio/health';

export default defineHealthCheck({
  universalIdentifier: HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'health-check',
  handler: async () => {
    const apiKey = getApiKey();

    return buildHealthResult(apiKey ? await checkApiKey({ apiKey }) : null);
  },
});
