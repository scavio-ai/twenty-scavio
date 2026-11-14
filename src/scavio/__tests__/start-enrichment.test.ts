import { describe, expect, it, vi } from 'vitest';

import {
  MISSING_KEY_MESSAGE,
  splitIntoChains,
  startEnrichment,
} from 'src/scavio/start-enrichment';
import { createFakeRepository } from 'src/scavio/__tests__/fake-repository';

const NOW = '2026-11-14T18:00:00.000Z';

const companies = [
  { id: 'a', domainName: { primaryLinkUrl: 'https://acme.com' } },
  { id: 'b', domainName: { primaryLinkUrl: '' } },
  { id: 'c', domainName: { primaryLinkUrl: 'beta.io' } },
  { id: 'd', domainName: null },
];

describe('splitIntoChains', () => {
  it('spreads ids over at most n lists', () => {
    expect(splitIntoChains(['1', '2', '3', '4', '5'], 2)).toEqual([['1', '3', '5'], ['2', '4']]);
    expect(splitIntoChains(['1'], 5)).toEqual([['1']]);
    expect(splitIntoChains(['1', '2'], 0)).toEqual([['1', '2']]);
  });
});

describe('startEnrichment', () => {
  it('queues companies with a website and marks the rest', async () => {
    const { repository, records } = createFakeRepository(companies);
    const enqueueWorkers = vi.fn().mockResolvedValue(undefined);

    const result = await startEnrichment({
      recordIds: ['a', 'b', 'c', 'd', 'missing'],
      repository,
      enqueueWorkers,
      apiKey: 'sk_x',
      parallelRequests: 1,
      now: NOW,
    });

    expect(result).toEqual({ success: true, queued: 2, noWebsite: 2, notFound: 1 });
    expect(enqueueWorkers).toHaveBeenCalledWith([{ companyIds: ['a', 'c'], rateLimitRetries: 0 }]);
    expect(records.get('a')?.scavioEnrichmentStatus).toBe('QUEUED');
    expect(records.get('b')?.scavioEnrichmentStatus).toBe('NO_WEBSITE');
    expect(records.get('d')?.scavioEnrichmentStatus).toBe('NO_WEBSITE');
  });

  it('starts one chain per allowed parallel request', async () => {
    const { repository } = createFakeRepository(companies);
    const enqueueWorkers = vi.fn().mockResolvedValue(undefined);

    await startEnrichment({
      recordIds: ['a', 'c'], repository, enqueueWorkers, apiKey: 'sk_x', parallelRequests: 4, now: NOW,
    });

    expect(enqueueWorkers.mock.calls[0][0]).toHaveLength(2);
  });

  it('does nothing without a key', async () => {
    const { repository, writes } = createFakeRepository(companies);
    const enqueueWorkers = vi.fn();

    const result = await startEnrichment({
      recordIds: ['a'], repository, enqueueWorkers, apiKey: undefined, parallelRequests: 1, now: NOW,
    });

    expect(result).toMatchObject({ success: false, message: MISSING_KEY_MESSAGE });
    expect(writes).toEqual([]);
    expect(enqueueWorkers).not.toHaveBeenCalled();
  });

  it('marks queued companies failed when the queue refuses', async () => {
    const { repository, records } = createFakeRepository(companies);

    const result = await startEnrichment({
      recordIds: ['a'],
      repository,
      enqueueWorkers: vi.fn().mockRejectedValue(new Error('queue down')),
      apiKey: 'sk_x',
      parallelRequests: 1,
      now: NOW,
    });

    expect(result.success).toBe(false);
    expect(records.get('a')?.scavioEnrichmentStatus).toBe('FAILED');
  });
});
