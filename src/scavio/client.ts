import {
  CLIENT_SOURCE_HEADER_VALUE,
  ENRICH_REQUEST_TIMEOUT_MS,
  SCAVIO_BASE_URL,
  SCAVIO_ENRICH_PATH,
  SCAVIO_USAGE_PATH,
  USER_AGENT,
} from 'src/scavio/constants';
import {
  type EnrichOutcome,
  type ScavioEnrichResponse,
} from 'src/scavio/types';

type FetchLike = typeof fetch;

const buildHeaders = (apiKey: string): Record<string, string> => ({
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'User-Agent': USER_AGENT,
  'x-client-source': CLIENT_SOURCE_HEADER_VALUE,
});

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body?.error === 'string' && body.error !== '') {
      return body.error.slice(0, 300);
    }
  } catch {
    // Not JSON: fall through to the status line.
  }

  return `Scavio answered HTTP ${response.status}.`;
};

const isScavioEnrichResponse = (
  value: unknown,
): value is ScavioEnrichResponse => {
  const data = (value as { data?: { company?: unknown } } | null)?.data;

  return typeof data === 'object' && data !== null &&
    typeof data.company === 'object' && data.company !== null;
};

// One enrich call. Never throws and never retries; the caller decides what
// an outcome means for the rest of the run. The key only travels in the
// Authorization header and is never part of a returned message.
export const enrichCompany = async ({
  apiKey,
  domain,
  fetchImpl = fetch,
  timeoutMs = ENRICH_REQUEST_TIMEOUT_MS,
}: {
  apiKey: string;
  domain: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}): Promise<EnrichOutcome> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${SCAVIO_BASE_URL}${SCAVIO_ENRICH_PATH}`, {
      method: 'POST',
      headers: buildHeaders(apiKey),
      body: JSON.stringify({ url: domain }),
      signal: controller.signal,
    });

    switch (response.status) {
      case 200: {
        const body: unknown = await response.json();
        if (!isScavioEnrichResponse(body)) {
          return { kind: 'error', message: 'Scavio returned an unexpected response.' };
        }

        return { kind: 'ok', response: body };
      }
      case 400:
        return { kind: 'invalid', message: await readErrorMessage(response) };
      case 401:
      case 403:
        return { kind: 'auth' };
      case 402:
        return { kind: 'credits' };
      case 429:
        return { kind: 'rateLimited' };
      case 502:
        return { kind: 'unreachable' };
      default:
        return { kind: 'error', message: await readErrorMessage(response) };
    }
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';

    return {
      kind: 'error',
      message: aborted
        ? 'Scavio did not answer in time. Run the enrichment again for this company.'
        : 'Scavio could not be reached. Run the enrichment again for this company.',
    };
  } finally {
    clearTimeout(timer);
  }
};

export type KeyCheck =
  | { kind: 'ok'; creditBalance: number | null }
  | { kind: 'auth' }
  | { kind: 'error' };

// Free call (no credit) used by the health check.
export const checkApiKey = async ({
  apiKey,
  fetchImpl = fetch,
}: {
  apiKey: string;
  fetchImpl?: FetchLike;
}): Promise<KeyCheck> => {
  try {
    const response = await fetchImpl(`${SCAVIO_BASE_URL}${SCAVIO_USAGE_PATH}`, {
      method: 'GET',
      headers: buildHeaders(apiKey),
      signal: AbortSignal.timeout(15_000),
    });

    if (response.status === 401 || response.status === 403) {
      return { kind: 'auth' };
    }
    if (!response.ok) {
      return { kind: 'error' };
    }

    const body = (await response.json()) as { credit_balance?: unknown };

    return {
      kind: 'ok',
      creditBalance:
        typeof body?.credit_balance === 'number' ? body.credit_balance : null,
    };
  } catch {
    return { kind: 'error' };
  }
};
