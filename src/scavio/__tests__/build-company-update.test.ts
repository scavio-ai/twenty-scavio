import { describe, expect, it } from 'vitest';

import { buildCompanyUpdate } from 'src/scavio/build-company-update';
import {
  INTERSTATE_ROOFING,
  NORTH_AUSTIN_DENTISTRY,
  PLAUSIBLE,
} from 'src/scavio/__tests__/fixtures';

const NOW = '2026-11-14T18:00:00.000Z';

describe('buildCompanyUpdate', () => {
  it('maps a full response to the Scavio fields', () => {
    const { status, update } = buildCompanyUpdate({
      data: INTERSTATE_ROOFING.data,
      domain: 'interstateroof.com',
      existing: {},
      now: NOW,
    });

    expect(status).toBe('ENRICHED');
    expect(update).toEqual({
      scavioPhones: {
        primaryPhoneNumber: '3037639114',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
        additionalPhones: null,
      },
      scavioSocialProfiles: {
        primaryLinkUrl: 'https://www.facebook.com/interstateroof/',
        primaryLinkLabel: 'Facebook',
        secondaryLinks: [
          { url: 'https://www.instagram.com/interstate_roofingco/', label: 'Instagram' },
          { url: 'https://x.com/InterstateRoof', label: 'X' },
        ],
      },
      scavioOwnerName: 'Scott Riopelle',
      scavioOwnerTitle: 'President and Owner',
      scavioOwnerEmail: { primaryEmail: '', additionalEmails: null },
      scavioEnrichmentStatus: 'ENRICHED',
      scavioLastEnrichedAt: NOW,
      scavioEnrichmentNote: 'Owner found on https://interstateroof.com/about-us/',
    });
  });

  it('writes no email field when every email was junk', () => {
    const { update } = buildCompanyUpdate({
      data: NORTH_AUSTIN_DENTISTRY.data,
      domain: 'northaustindentist.com',
      existing: {},
      now: NOW,
    });

    expect(update).not.toHaveProperty('scavioEmails');
    expect(update.scavioContactPage).toEqual({
      primaryLinkUrl: 'https://northaustindentist.com/contact/',
      primaryLinkLabel: '',
      secondaryLinks: null,
    });
  });

  it('fills the standard LinkedIn field only when it is empty', () => {
    const filled = buildCompanyUpdate({
      data: PLAUSIBLE.data,
      domain: 'plausible.io',
      existing: { linkedinLink: { primaryLinkUrl: '' } },
      now: NOW,
    });
    const kept = buildCompanyUpdate({
      data: PLAUSIBLE.data,
      domain: 'plausible.io',
      existing: { linkedinLink: { primaryLinkUrl: 'https://linkedin.com/company/mine' } },
      now: NOW,
    });

    expect(filled.update.linkedinLink).toMatchObject({
      primaryLinkUrl: PLAUSIBLE.data.company.socials.linkedin,
    });
    expect(kept.update).not.toHaveProperty('linkedinLink');
  });

  it('reports NO_CONTACTS when the site published nothing', () => {
    const { status, update } = buildCompanyUpdate({
      data: {
        company: {
          name: null, website: null, domain: 'acme.com', emails: ['junk@words.here'],
          phones: [], socials: {}, contact_page: null, address: null, place_id: null,
        },
        owner: null,
        pages_read: ['https://acme.com/'],
      },
      domain: 'acme.com',
      existing: {},
      now: NOW,
    });

    expect(status).toBe('NO_CONTACTS');
    expect(update).toEqual({
      scavioEnrichmentStatus: 'NO_CONTACTS',
      scavioLastEnrichedAt: NOW,
      scavioEnrichmentNote:
        'Read 1 page(s) of acme.com; no published contact details found.',
    });
  });
});
