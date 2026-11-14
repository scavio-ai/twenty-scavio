import { MAX_COMPANIES_PER_RUN } from 'src/scavio/constants';
import { type CompanyRepository } from 'src/scavio/company-repository';
import { type EnqueueWorkers } from 'src/scavio/enqueue';
import { normalizeDomain } from 'src/scavio/normalize-domain';
import { type StartEnrichmentResult } from 'src/scavio/start-snackbar';

export const MISSING_KEY_MESSAGE =
  'Add your Scavio API key in Settings > Applications > Scavio Company Enrichment.';

// Splits the ids into `chains` lists of near-equal size. Each list becomes
// one worker that enriches its companies one after another, so at most
// `chains` Scavio requests are in flight for this run.
export const splitIntoChains = (ids: string[], chains: number): string[][] => {
  const count = Math.max(1, Math.min(chains, ids.length));
  const lists: string[][] = Array.from({ length: count }, () => []);
  ids.forEach((id, index) => lists[index % count].push(id));

  return lists.filter((list) => list.length > 0);
};

export const startEnrichment = async ({
  recordIds,
  repository,
  enqueueWorkers,
  apiKey,
  parallelRequests,
  now,
}: {
  recordIds: string[];
  repository: CompanyRepository;
  enqueueWorkers: EnqueueWorkers;
  apiKey: string | undefined;
  parallelRequests: number;
  now: string;
}): Promise<StartEnrichmentResult> => {
  if (!apiKey) {
    return { success: false, queued: 0, noWebsite: 0, notFound: 0, message: MISSING_KEY_MESSAGE };
  }

  const ids = recordIds.slice(0, MAX_COMPANIES_PER_RUN);
  const companies = await repository.read(ids);

  const withWebsite: string[] = [];
  const withoutWebsite: string[] = [];
  for (const company of companies) {
    (normalizeDomain(company.domainName?.primaryLinkUrl) ? withWebsite : withoutWebsite).push(
      company.id,
    );
  }

  if (withoutWebsite.length > 0) {
    await repository.updateMany(withoutWebsite, {
      scavioEnrichmentStatus: 'NO_WEBSITE',
      scavioEnrichmentNote: 'Add the company website (Domains field) to enrich it.',
      scavioLastEnrichedAt: now,
    });
  }

  if (withWebsite.length > 0) {
    await repository.updateMany(withWebsite, {
      scavioEnrichmentStatus: 'QUEUED',
      scavioEnrichmentNote: null,
    });

    try {
      await enqueueWorkers(
        splitIntoChains(withWebsite, parallelRequests).map((companyIds) => ({
          companyIds,
          rateLimitRetries: 0,
        })),
      );
    } catch {
      await repository.updateMany(withWebsite, {
        scavioEnrichmentStatus: 'FAILED',
        scavioEnrichmentNote: 'Twenty could not queue the enrichment. Try again.',
      });

      return {
        success: false,
        queued: 0,
        noWebsite: withoutWebsite.length,
        notFound: ids.length - companies.length,
        message: 'Twenty could not queue the enrichment. Try again.',
      };
    }
  }

  return {
    success: true,
    queued: withWebsite.length,
    noWebsite: withoutWebsite.length,
    notFound: ids.length - companies.length,
  };
};
