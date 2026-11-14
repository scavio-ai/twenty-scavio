import { describe, expect, it, vi } from 'vitest';

import {
  AUTH_MESSAGE,
  CREDITS_MESSAGE,
  RATE_LIMIT_MESSAGE,
  runWorker,
} from 'src/scavio/run-worker';
import { MISSING_KEY_MESSAGE } from 'src/scavio/start-enrichment';
import { type EnrichOutcome } from 'src/scavio/types';
import { createFakeRepository } from 'src/scavio/__tests__/fake-repository';
import { INTERSTATE_ROOFING } from 'src/scavio/__tests__/fixtures';

const NOW = '2026-11-14T18:00:00.000Z';

const companies = [
  { id: 'a', domainName: { primaryLinkUrl: 'interstateroof.com' }, scavioEnrichmentStatus: 'QUEUED' },
  { id: 'b', domainName: { primaryLinkUrl: 'dead-site.com' }, scavioEnrichmentStatus: 'QUEUED' },
  { id: 'c', domainName: { primaryLinkUrl: 'beta.io' }, scavioEnrichmentStatus: 'QUEUED' },
];

const setup = (outcomes: EnrichOutcome[], clock: number[] = [0]) => {
  const fake = createFakeRepository(companies);
  const enrich = vi.fn();
  outcomes.forEach((outcome) => enrich.mockResolvedValueOnce(outcome));
  const enqueueWorkers = vi.fn().mockResolvedValue(undefined);
  let tick = 0;
  const nowMs = () => clock[Math.min(tick++, clock.length - 1)];

  return { ...fake, enrich, enqueueWorkers, nowMs, nowIso: () => NOW };
};

const ok: EnrichOutcome = { kind: 'ok', response: INTERSTATE_ROOFING };

describe('runWorker', () => {
  it('enriches every company in order and records each outcome', async () => {
    const t = setup([ok, { kind: 'unreachable' }, { kind: 'error', message: 'Scavio answered HTTP 500.' }]);

    const result = await runWorker({
      payload: { companyIds: ['a', 'b', 'c'], rateLimitRetries: 0 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: 'sk_x', nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result).toEqual({ processed: 3 });
    expect(t.enrich.mock.calls.map(([domain]) => domain)).toEqual([
      'interstateroof.com', 'dead-site.com', 'beta.io',
    ]);
    expect(t.records.get('a')?.scavioEnrichmentStatus).toBe('ENRICHED');
    expect(t.records.get('a')?.scavioOwnerName).toBe('Scott Riopelle');
    expect(t.records.get('b')?.scavioEnrichmentStatus).toBe('UNREACHABLE');
    expect(t.records.get('c')).toMatchObject({
      scavioEnrichmentStatus: 'FAILED',
      scavioEnrichmentNote: 'Scavio answered HTTP 500.',
    });
    expect(t.enqueueWorkers).not.toHaveBeenCalled();
  });

  it('stops the chain on a rejected key', async () => {
    const t = setup([ok, { kind: 'auth' }]);

    const result = await runWorker({
      payload: { companyIds: ['a', 'b', 'c'], rateLimitRetries: 0 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: 'sk_x', nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result).toEqual({ processed: 1, stoppedBecause: 'auth' });
    expect(t.enrich).toHaveBeenCalledTimes(2);
    expect(t.records.get('c')).toMatchObject({
      scavioEnrichmentStatus: 'FAILED', scavioEnrichmentNote: AUTH_MESSAGE,
    });
  });

  it('marks the rest out of credits on a 402', async () => {
    const t = setup([{ kind: 'credits' }]);

    const result = await runWorker({
      payload: { companyIds: ['a', 'b'], rateLimitRetries: 0 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: 'sk_x', nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result.stoppedBecause).toBe('credits');
    expect(t.enrich).toHaveBeenCalledTimes(1);
    for (const id of ['a', 'b']) {
      expect(t.records.get(id)).toMatchObject({
        scavioEnrichmentStatus: 'OUT_OF_CREDITS', scavioEnrichmentNote: CREDITS_MESSAGE,
      });
    }
  });

  it('hands the rest back to the queue with a delay on a 429', async () => {
    const t = setup([ok, { kind: 'rateLimited' }]);

    const result = await runWorker({
      payload: { companyIds: ['a', 'b', 'c'], rateLimitRetries: 2 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: 'sk_x', nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result).toEqual({ processed: 1, requeuedAfterRateLimit: true });
    expect(t.enqueueWorkers).toHaveBeenCalledWith(
      [{ companyIds: ['b', 'c'], rateLimitRetries: 3 }],
      { delayMs: 30_000 },
    );
  });

  it('gives up after too many 429s', async () => {
    const t = setup([{ kind: 'rateLimited' }]);

    const result = await runWorker({
      payload: { companyIds: ['a'], rateLimitRetries: 20 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: 'sk_x', nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result.stoppedBecause).toBe('rateLimited');
    expect(t.enqueueWorkers).not.toHaveBeenCalled();
    expect(t.records.get('a')?.scavioEnrichmentNote).toBe(RATE_LIMIT_MESSAGE);
  });

  it('continues in a new job once its time budget is spent', async () => {
    const t = setup([ok], [0, 700_000]);

    const result = await runWorker({
      payload: { companyIds: ['a', 'b', 'c'], rateLimitRetries: 1 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: 'sk_x', nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result).toEqual({ processed: 1, continued: true });
    expect(t.enqueueWorkers).toHaveBeenCalledWith([{ companyIds: ['b', 'c'], rateLimitRetries: 1 }]);
  });

  it('skips deleted companies and ones whose website was removed', async () => {
    const t = setup([]);
    await t.repository.update('a', { domainName: { primaryLinkUrl: '' } });

    const result = await runWorker({
      payload: { companyIds: ['gone', 'a'], rateLimitRetries: 0 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: 'sk_x', nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result).toEqual({ processed: 2 });
    expect(t.enrich).not.toHaveBeenCalled();
    expect(t.records.get('a')?.scavioEnrichmentStatus).toBe('NO_WEBSITE');
  });

  it('skips companies whose status was changed to cancel the run', async () => {
    const t = setup([ok]);
    await t.repository.update('a', { scavioEnrichmentStatus: null });
    await t.repository.update('b', { scavioEnrichmentStatus: 'FAILED' });

    const result = await runWorker({
      payload: { companyIds: ['a', 'b', 'c'], rateLimitRetries: 0 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: 'sk_x', nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result).toEqual({ processed: 3 });
    expect(t.enrich.mock.calls.map(([domain]) => domain)).toEqual(['beta.io']);
  });

  it('marks everything failed without a key and calls nothing', async () => {
    const t = setup([]);

    const result = await runWorker({
      payload: { companyIds: ['a', 'b'], rateLimitRetries: 0 },
      repository: t.repository, enrich: t.enrich, enqueueWorkers: t.enqueueWorkers,
      apiKey: undefined, nowMs: t.nowMs, nowIso: t.nowIso,
    });

    expect(result.stoppedBecause).toBe('missingKey');
    expect(t.enrich).not.toHaveBeenCalled();
    expect(t.records.get('b')?.scavioEnrichmentNote).toBe(MISSING_KEY_MESSAGE);
  });
});
