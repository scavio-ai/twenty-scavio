import { describe, expect, it } from 'vitest';

import {
  cleanEmails,
  cleanPhones,
  guessCountryFromDomain,
} from 'src/scavio/clean-contacts';
import {
  AUSTIN_DENTAL_WORKS,
  NORTH_AUSTIN_DENTISTRY,
  PLAUSIBLE,
} from 'src/scavio/__tests__/fixtures';

describe('cleanEmails', () => {
  it('drops phrases parsed as emails from page text', () => {
    expect(
      cleanEmails(NORTH_AUSTIN_DENTISTRY.data.company.emails, 'northaustindentist.com'),
    ).toEqual([]);
  });

  it('keeps addresses on the company domain and drops the rest', () => {
    expect(cleanEmails(PLAUSIBLE.data.company.emails, 'plausible.io')).toEqual([
      'hello@plausible.io',
      'available@plausible.io',
      'privacy@plausible.io',
    ]);
  });

  it('keeps common mailbox providers and subdomains, lowercases and dedupes', () => {
    expect(
      cleanEmails(
        ['Owner@Gmail.com', 'owner@gmail.com', 'team@mail.acme.com', 'x@other.com', 42, 'bad'],
        'acme.com',
      ),
    ).toEqual(['owner@gmail.com', 'team@mail.acme.com']);
  });

  it('caps the list at 10', () => {
    const many = Array.from({ length: 15 }, (_, index) => `a${index}@acme.com`);

    expect(cleanEmails(many, 'acme.com')).toHaveLength(10);
  });
});

describe('cleanPhones', () => {
  it('drops malformed numbers and copies of the same number', () => {
    expect(
      cleanPhones(NORTH_AUSTIN_DENTISTRY.data.company.phones, 'northaustindentist.com'),
    ).toEqual([
      { number: '5128171168', countryCode: 'US', callingCode: '+1' },
      { number: '5124583111', countryCode: 'US', callingCode: '+1' },
    ]);
  });

  it('reads the E.164 numbers the API returns since 2026-11-15', () => {
    expect(
      cleanPhones(['+15128171168', '+15124583111', '+15128171168'], 'northaustindentist.com'),
    ).toEqual([
      { number: '5128171168', countryCode: 'US', callingCode: '+1' },
      { number: '5124583111', countryCode: 'US', callingCode: '+1' },
    ]);
    expect(cleanPhones(['+495681939521'], 'stuhlmann.de')).toEqual([
      { number: '5681939521', countryCode: 'DE', callingCode: '+49' },
    ]);
  });

  it('keeps one valid number out of three spellings', () => {
    expect(
      cleanPhones(AUSTIN_DENTAL_WORKS.data.company.phones, 'austindentalworks.com'),
    ).toEqual([{ number: '5124540300', countryCode: 'US', callingCode: '+1' }]);
  });

  it('treats +1 and bare forms of one number as the same', () => {
    expect(cleanPhones(['5124518256', '+15124518256'], 'acme.com')).toHaveLength(1);
  });

  it('reads national numbers in the country of the domain', () => {
    expect(cleanPhones(['020 7946 0958'], 'acme.co.uk')).toEqual([
      { number: '2079460958', countryCode: 'GB', callingCode: '+44' },
    ]);
  });
});

describe('guessCountryFromDomain', () => {
  it('maps country TLDs and falls back to US for generic ones', () => {
    expect(guessCountryFromDomain('acme.de')).toBe('DE');
    expect(guessCountryFromDomain('acme.co.uk')).toBe('GB');
    expect(guessCountryFromDomain('acme.io')).toBe('US');
    expect(guessCountryFromDomain('acme.com')).toBe('US');
  });
});
