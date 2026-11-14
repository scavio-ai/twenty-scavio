import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import {
  LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS,
  START_ENRICHMENT_ROUTE_PATH,
} from 'src/constants/universal-identifiers';
import { createCompanyRepository } from 'src/scavio/company-repository';
import { enqueueWorkers } from 'src/scavio/enqueue-workers';
import { extractRecordIds, type RecordInput } from 'src/scavio/record-ids';
import { getApiKey, getParallelRequests } from 'src/scavio/settings';
import { startEnrichment } from 'src/scavio/start-enrichment';

type WorkflowInput = { records?: RecordInput | RecordInput[] };
type RouteBody = { recordIds?: string[] };

const isRoutePayload = (
  input: WorkflowInput | RoutePayload<RouteBody>,
): input is RoutePayload<RouteBody> =>
  typeof input === 'object' && input !== null && 'requestContext' in input;

const handler = async (input: WorkflowInput | RoutePayload<RouteBody>) => {
  const recordIds = isRoutePayload(input)
    ? extractRecordIds(input.body?.recordIds ?? [])
    : extractRecordIds(input?.records ?? []);

  return startEnrichment({
    recordIds,
    repository: createCompanyRepository(new CoreApiClient()),
    enqueueWorkers,
    apiKey: getApiKey(),
    parallelRequests: getParallelRequests(),
    now: new Date().toISOString(),
  });
};

export default defineLogicFunction({
  universalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.startEnrichment,
  name: 'start-scavio-enrichment',
  description:
    'Queues a Scavio enrichment for the given companies. Results are written to each company as it finishes.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: START_ENRICHMENT_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  workflowActionTriggerSettings: {
    label: 'Enrich companies with Scavio',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          records: {
            type: 'records',
            objectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
            label: 'Companies',
          },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean', label: 'Started' },
          queued: { type: 'number', label: 'Companies queued' },
          noWebsite: { type: 'number', label: 'Companies without a website' },
          notFound: { type: 'number', label: 'Companies not found' },
          message: { type: 'string', label: 'Message' },
        },
      },
    ],
  },
});
