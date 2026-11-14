import {
  DEFAULT_PARALLEL_REQUESTS,
  MAX_PARALLEL_REQUESTS,
  PARALLEL_REQUESTS_ENV_VAR_NAME,
  SCAVIO_API_KEY_ENV_VAR_NAME,
} from 'src/scavio/constants';

export const getApiKey = (): string | undefined => {
  const key = process.env[SCAVIO_API_KEY_ENV_VAR_NAME]?.trim();

  return key ? key : undefined;
};

export const getParallelRequests = (): number => {
  const raw = Number(process.env[PARALLEL_REQUESTS_ENV_VAR_NAME]);

  if (!Number.isFinite(raw) || raw < 1) {
    return DEFAULT_PARALLEL_REQUESTS;
  }

  return Math.min(Math.floor(raw), MAX_PARALLEL_REQUESTS);
};
