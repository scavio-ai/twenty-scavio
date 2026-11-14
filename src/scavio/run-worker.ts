import { buildCompanyUpdate } from 'src/scavio/build-company-update';
import {
  MAX_RATE_LIMIT_RETRIES,
  RATE_LIMIT_RETRY_DELAY_MS,
  WORKER_START_BUDGET_MS,
} from 'src/scavio/constants';
import { type CompanyRepository } from 'src/scavio/company-repository';
import { type EnqueueWorkers, type WorkerPayload } from 'src/scavio/enqueue';
import { normalizeDomain } from 'src/scavio/normalize-domain';
import { MISSING_KEY_MESSAGE } from 'src/scavio/start-enrichment';
import { type EnrichOutcome } from 'src/scavio/types';

export type WorkerResult = {
  processed: number;
  stoppedBecause?: 'auth' | 'credits' | 'rateLimited' | 'missingKey';
  continued?: boolean;
  requeuedAfterRateLimit?: boolean;
};

export const AUTH_MESSAGE =
  'Scavio rejected the API key. Check it in Settings > Applications > Scavio Company Enrichment, then run the enrichment again.';
export const CREDITS_MESSAGE =
  'The Scavio account is out of credits. Add credits at https://dashboard.scavio.dev, then run the enrichment again.';
export const RATE_LIMIT_MESSAGE =
  'Scavio kept answering "too many requests". Lower "Companies enriched at the same time" in the app settings, then run the enrichment again.';

// Enriches the companies of one chain one after another. A company is only
// enriched while its status is still QUEUED, which is how a run is cancelled. Ends early, and
// hands the rest back to the queue, when its time budget is spent or Scavio
// asks it to slow down. Stops the chain for good on a rejected key or an
// empty balance, since every later company would fail the same way.
export const runWorker = async ({
  payload,
  repository,
  enrich,
  enqueueWorkers,
  apiKey,
  nowMs,
  nowIso,
}: {
  payload: WorkerPayload;
  repository: CompanyRepository;
  enrich: (domain: string) => Promise<EnrichOutcome>;
  enqueueWorkers: EnqueueWorkers;
  apiKey: string | undefined;
  nowMs: () => number;
  nowIso: () => string;
}): Promise<WorkerResult> => {
  const ids = payload.companyIds ?? [];
  const startedAt = nowMs();

  const stopAll = async (remaining: string[], status: string, note: string) => {
    await repository.updateMany(remaining, {
      scavioEnrichmentStatus: status,
      scavioEnrichmentNote: note,
      scavioLastEnrichedAt: nowIso(),
    });
  };

  if (!apiKey) {
    await stopAll(ids, 'FAILED', MISSING_KEY_MESSAGE);

    return { processed: 0, stoppedBecause: 'missingKey' };
  }

  for (let index = 0; index < ids.length; index += 1) {
    const remaining = ids.slice(index);

    if (index > 0 && nowMs() - startedAt > WORKER_START_BUDGET_MS) {
      await enqueueWorkers([
        { companyIds: remaining, rateLimitRetries: payload.rateLimitRetries ?? 0 },
      ]);

      return { processed: index, continued: true };
    }

    const [company] = await repository.read([ids[index]]);
    // Deleted, or no longer queued: someone changed the status to cancel.
    if (!company || company.scavioEnrichmentStatus !== 'QUEUED') {
      continue;
    }

    const domain = normalizeDomain(company.domainName?.primaryLinkUrl);
    if (!domain) {
      await repository.update(company.id, {
        scavioEnrichmentStatus: 'NO_WEBSITE',
        scavioEnrichmentNote: 'Add the company website (Domains field) to enrich it.',
        scavioLastEnrichedAt: nowIso(),
      });
      continue;
    }

    const outcome = await enrich(domain);

    switch (outcome.kind) {
      case 'ok': {
        const { update } = buildCompanyUpdate({
          data: outcome.response.data,
          domain,
          existing: company,
          now: nowIso(),
        });
        try {
          await repository.update(company.id, update);
        } catch {
          await repository.update(company.id, {
            scavioEnrichmentStatus: 'FAILED',
            scavioEnrichmentNote: 'Scavio answered, but Twenty could not save the result.',
            scavioLastEnrichedAt: nowIso(),
          });
        }
        break;
      }
      case 'unreachable':
        await repository.update(company.id, {
          scavioEnrichmentStatus: 'UNREACHABLE',
          scavioEnrichmentNote: `Could not reach ${domain}. No credits were charged.`,
          scavioLastEnrichedAt: nowIso(),
        });
        break;
      case 'invalid':
      case 'error':
        await repository.update(company.id, {
          scavioEnrichmentStatus: 'FAILED',
          scavioEnrichmentNote: outcome.message,
          scavioLastEnrichedAt: nowIso(),
        });
        break;
      case 'auth':
        await stopAll(remaining, 'FAILED', AUTH_MESSAGE);

        return { processed: index, stoppedBecause: 'auth' };
      case 'credits':
        await stopAll(remaining, 'OUT_OF_CREDITS', CREDITS_MESSAGE);

        return { processed: index, stoppedBecause: 'credits' };
      case 'rateLimited': {
        const retries = payload.rateLimitRetries ?? 0;
        if (retries >= MAX_RATE_LIMIT_RETRIES) {
          await stopAll(remaining, 'FAILED', RATE_LIMIT_MESSAGE);

          return { processed: index, stoppedBecause: 'rateLimited' };
        }

        await enqueueWorkers(
          [{ companyIds: remaining, rateLimitRetries: retries + 1 }],
          { delayMs: RATE_LIMIT_RETRY_DELAY_MS },
        );

        return { processed: index, requeuedAfterRateLimit: true };
      }
    }
  }

  return { processed: ids.length };
};
