import { type KeyCheck } from 'src/scavio/client';
import { SCAVIO_SIGNUP_URL } from 'src/scavio/constants';

// The cost of enriching one company from its website.
const CREDITS_PER_COMPANY = 10;

type HealthResult =
  | { status: 'OK' }
  | {
      status: 'ERROR' | 'WARNING' | 'INFO';
      title: string;
      description?: string;
      action?: { label: string; location?: string };
    };

export const buildHealthResult = (check: KeyCheck | null): HealthResult => {
  if (check === null) {
    return {
      status: 'INFO',
      title: 'Add your Scavio API key to start enriching companies',
      description: `Create a free account at ${SCAVIO_SIGNUP_URL} (50 free credits), then paste the key here.`,
      action: { label: 'Add the key', location: '#variables' },
    };
  }

  if (check.kind === 'auth') {
    return {
      status: 'ERROR',
      title: 'Scavio rejected this API key',
      description: 'Copy the key again from https://dashboard.scavio.dev and save it here.',
      action: { label: 'Update the key', location: '#variables' },
    };
  }

  if (check.kind === 'error') {
    return {
      status: 'WARNING',
      title: 'Could not reach Scavio to check the key',
      description: 'Enrichment may fail until Scavio is reachable again.',
    };
  }

  if (check.creditBalance !== null && check.creditBalance < CREDITS_PER_COMPANY) {
    return {
      status: 'WARNING',
      title: 'Your Scavio account is out of credits',
      description: 'Each company costs 10 credits. Add credits at https://dashboard.scavio.dev.',
    };
  }

  return { status: 'OK' };
};
