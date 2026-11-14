import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichCompany } from 'src/scavio/client';
import { createCompanyRepository } from 'src/scavio/company-repository';
import { WORKER_TIMEOUT_SECONDS } from 'src/scavio/constants';
import { type WorkerPayload } from 'src/scavio/enqueue';
import { enqueueWorkers } from 'src/scavio/enqueue-workers';
import { runWorker } from 'src/scavio/run-worker';
import { getApiKey } from 'src/scavio/settings';

const handler = async (payload: WorkerPayload) => {
  const apiKey = getApiKey();

  return runWorker({
    payload,
    repository: createCompanyRepository(new CoreApiClient()),
    enrich: (domain) => enrichCompany({ apiKey: apiKey ?? '', domain }),
    enqueueWorkers,
    apiKey,
    nowMs: () => Date.now(),
    nowIso: () => new Date().toISOString(),
  });
};

export default defineLogicFunction({
  universalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichWorker,
  name: 'scavio-enrich-worker',
  description:
    'Background job: enriches a list of companies one after another through the Scavio API.',
  timeoutSeconds: WORKER_TIMEOUT_SECONDS,
  handler,
});
