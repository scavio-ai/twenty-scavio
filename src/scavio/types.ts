export type SocialNetwork =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'tiktok'
  | 'youtube'
  | 'pinterest';

export type ScavioCompanyData = {
  company: {
    name: string | null;
    website: string | null;
    domain: string | null;
    emails: string[];
    phones: string[];
    socials: Partial<Record<SocialNetwork, string>>;
    contact_page: string | null;
    address: string | null;
    place_id: string | null;
  };
  owner: {
    name: string;
    title: string;
    source_url: string;
    email: string | null;
    email_status: 'published' | 'verified' | 'risky' | 'not_found';
  } | null;
  pages_read: string[];
};

export type ScavioEnrichResponse = {
  data: ScavioCompanyData;
  response_time: number;
  fetched_at: string;
  credits_used: number;
  credits_remaining: number;
};

export type EnrichmentStatus =
  | 'QUEUED'
  | 'ENRICHED'
  | 'NO_CONTACTS'
  | 'NO_WEBSITE'
  | 'UNREACHABLE'
  | 'OUT_OF_CREDITS'
  | 'FAILED';

// What one enrich call came to. `stopChain` outcomes end the whole run:
// the key or the balance will not change for the next company either.
export type EnrichOutcome =
  | { kind: 'ok'; response: ScavioEnrichResponse }
  | { kind: 'unreachable' }
  | { kind: 'invalid'; message: string }
  | { kind: 'auth' }
  | { kind: 'credits' }
  | { kind: 'rateLimited' }
  | { kind: 'error'; message: string };
