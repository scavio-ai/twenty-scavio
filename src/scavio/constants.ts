export const SCAVIO_API_KEY_ENV_VAR_NAME = 'SCAVIO_API_KEY';
export const PARALLEL_REQUESTS_ENV_VAR_NAME = 'SCAVIO_PARALLEL_REQUESTS';

export const SCAVIO_BASE_URL = 'https://api.scavio.dev';
export const SCAVIO_ENRICH_PATH = '/api/v1/company/enrich';
export const SCAVIO_USAGE_PATH = '/api/v1/usage';
export const SCAVIO_SIGNUP_URL = 'https://scavio.dev/?via=twenty';

export const CLIENT_SOURCE_HEADER_VALUE = 'twenty-app';
export const USER_AGENT = 'scavio-twenty/0.1.0';

export const DEFAULT_PARALLEL_REQUESTS = 1;
export const MAX_PARALLEL_REQUESTS = 10;

// The enrich endpoint reads several pages of a site; measured 8-32 s on 20
// real sites (2026-11-14), with a long tail in production logs.
export const ENRICH_REQUEST_TIMEOUT_MS = 180_000;

// The worker runs for at most 900 s. It stops starting new companies once
// this much time has passed, so one more slow request still fits.
export const WORKER_TIMEOUT_SECONDS = 900;
export const WORKER_START_BUDGET_MS = 600_000;

// A 429 hands the rest of the chain back to the queue after this delay.
export const RATE_LIMIT_RETRY_DELAY_MS = 30_000;
export const MAX_RATE_LIMIT_RETRIES = 20;

export const MAX_COMPANIES_PER_RUN = 1000;
export const MAX_EMAILS = 10;
export const MAX_PHONES = 5;
