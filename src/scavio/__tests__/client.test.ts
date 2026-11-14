import { describe, expect, it, vi } from 'vitest';

import { checkApiKey, enrichCompany } from 'src/scavio/client';
import { INTERSTATE_ROOFING } from 'src/scavio/__tests__/fixtures';

const KEY = 'sk_test_secret_value';

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

describe('enrichCompany', () => {
  it('posts the domain with the key in the Authorization header only', async () => {
    const fetchImpl = respond(200, INTERSTATE_ROOFING);

    const outcome = await enrichCompany({ apiKey: KEY, domain: 'interstateroof.com', fetchImpl });

    expect(outcome).toEqual({ kind: 'ok', response: INTERSTATE_ROOFING });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.scavio.dev/api/v1/company/enrich');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ url: 'interstateroof.com' });
    expect(init.headers).toMatchObject({
      Authorization: `Bearer ${KEY}`,
      'x-client-source': 'twenty-app',
    });
    expect(url).not.toContain(KEY);
  });

  it.each([
    [401, { kind: 'auth' }],
    [402, { kind: 'credits' }],
    [429, { kind: 'rateLimited' }],
    [502, { kind: 'unreachable' }],
  ])('maps HTTP %s with one request', async (status, expected) => {
    const fetchImpl = respond(status, { error: 'x' });

    expect(await enrichCompany({ apiKey: KEY, domain: 'acme.com', fetchImpl })).toEqual(expected);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('passes the API error text on a 400 and a 500, never the key', async () => {
    const invalid = await enrichCompany({
      apiKey: KEY, domain: 'acme.com', fetchImpl: respond(400, { error: 'Provide url or place_id.' }),
    });
    const failed = await enrichCompany({
      apiKey: KEY, domain: 'acme.com', fetchImpl: respond(500, 'oops'),
    });

    expect(invalid).toEqual({ kind: 'invalid', message: 'Provide url or place_id.' });
    expect(failed).toEqual({ kind: 'error', message: 'Scavio answered HTTP 500.' });
    expect(JSON.stringify([invalid, failed])).not.toContain(KEY);
  });

  it('reports a timeout without throwing', async () => {
    const fetchImpl = vi.fn((_url: string, init: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init.signal?.addEventListener('abort', () =>
          reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
        );
      }),
    );

    const outcome = await enrichCompany({
      apiKey: KEY, domain: 'acme.com', fetchImpl: fetchImpl as unknown as typeof fetch, timeoutMs: 5,
    });

    expect(outcome).toEqual({
      kind: 'error',
      message: 'Scavio did not answer in time. Run the enrichment again for this company.',
    });
  });

  it('rejects a 200 without company data', async () => {
    expect(
      await enrichCompany({ apiKey: KEY, domain: 'acme.com', fetchImpl: respond(200, { data: {} }) }),
    ).toEqual({ kind: 'error', message: 'Scavio returned an unexpected response.' });
  });
});

describe('checkApiKey', () => {
  it('reads the balance from the free usage endpoint', async () => {
    const fetchImpl = respond(200, { plan: 'hobby', credit_balance: 120 });

    expect(await checkApiKey({ apiKey: KEY, fetchImpl })).toEqual({ kind: 'ok', creditBalance: 120 });
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.scavio.dev/api/v1/usage');
    expect(fetchImpl.mock.calls[0][1].method).toBe('GET');
  });

  it('maps a rejected key and a network failure', async () => {
    expect(await checkApiKey({ apiKey: KEY, fetchImpl: respond(401, {}) })).toEqual({ kind: 'auth' });
    expect(
      await checkApiKey({ apiKey: KEY, fetchImpl: vi.fn().mockRejectedValue(new Error('down')) }),
    ).toEqual({ kind: 'error' });
  });
});
