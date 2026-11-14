import { enqueueJobs } from 'twenty-sdk/logic-function';

import { LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { type EnqueueWorkers } from 'src/scavio/enqueue';

export const enqueueWorkers: EnqueueWorkers = async (payloads, options) => {
  if (payloads.length === 0) {
    return;
  }

  await enqueueJobs({
    logicFunctionUniversalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichWorker,
    jobs: payloads.map((payload) => ({ payload })),
    ...(options?.delayMs ? { delayMs: options.delayMs } : {}),
  });
};
