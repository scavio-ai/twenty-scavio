import {
  type CountryCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

import { MAX_EMAILS, MAX_PHONES } from 'src/scavio/constants';

const EMAIL_REGEX = /^[a-z0-9._%+-]+@([a-z0-9-]+\.)+[a-z]{2,24}$/;

// Mailbox providers small businesses use instead of their own domain.
const FREE_MAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'outlook.com',
  'hotmail.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'protonmail.com', 'proton.me', 'zoho.com', 'gmx.com', 'gmx.de',
  'gmx.net', 'web.de', 'mail.com', 'yandex.com', 'comcast.net', 'att.net',
  'sbcglobal.net', 'bellsouth.net', 'verizon.net', 'cox.net', 'charter.net',
  'yahoo.co.uk', 'hotmail.co.uk', 'btinternet.com', 'orange.fr', 'free.fr',
  'laposte.net', 'libero.it', 'hotmail.fr', 'yahoo.fr', 'outlook.fr',
]);

const isSameSite = (emailDomain: string, companyDomain: string): boolean =>
  emailDomain === companyDomain ||
  emailDomain.endsWith(`.${companyDomain}`) ||
  companyDomain.endsWith(`.${emailDomain}`);

// The enrich endpoint reads free text, so a phrase like "time@home.dr.miller"
// can come back as an email. A CRM record should only get addresses that
// belong to the company: its own domain, or a common mailbox provider.
export const cleanEmails = (
  emails: readonly unknown[] | undefined,
  companyDomain: string,
): string[] => {
  const kept: string[] = [];
  const seen = new Set<string>();

  for (const raw of emails ?? []) {
    if (typeof raw !== 'string') {
      continue;
    }

    const email = raw.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email) || seen.has(email)) {
      continue;
    }

    const emailDomain = email.split('@')[1];
    if (!isSameSite(emailDomain, companyDomain) && !FREE_MAIL_DOMAINS.has(emailDomain)) {
      continue;
    }

    seen.add(email);
    kept.push(email);
  }

  return kept.slice(0, MAX_EMAILS);
};

// Country-code TLDs whose code is not the ISO country code, plus TLDs that
// are used as generic ones and say nothing about the country.
const TLD_COUNTRY_OVERRIDES: Record<string, CountryCode | null> = {
  uk: 'GB',
  io: null,
  co: null,
  ai: null,
  me: null,
  tv: null,
  fm: null,
  ly: null,
  so: null,
  sh: null,
  gg: null,
  to: null,
  cc: null,
  ws: null,
};

export const guessCountryFromDomain = (domain: string): CountryCode => {
  const tld = domain.split('.').pop() ?? '';

  if (tld in TLD_COUNTRY_OVERRIDES) {
    return TLD_COUNTRY_OVERRIDES[tld] ?? 'US';
  }
  if (tld.length === 2) {
    return tld.toUpperCase() as CountryCode;
  }

  return 'US';
};

export type CleanPhone = {
  number: string;
  countryCode: string;
  callingCode: string;
};

const lastTenDigits = (value: string): string =>
  value.replace(/\D/g, '').slice(-10);

// Keeps numbers that parse as valid, prefers ones in the company's country,
// and drops copies of the same number written another way
// ("5124518256" and "+15124518256").
export const cleanPhones = (
  phones: readonly unknown[] | undefined,
  companyDomain: string,
): CleanPhone[] => {
  const defaultCountry = guessCountryFromDomain(companyDomain);

  const parsed = (phones ?? [])
    .filter((raw): raw is string => typeof raw === 'string')
    .map((raw) => ({ raw, phone: parsePhoneNumberFromString(raw, defaultCountry) }))
    .filter(({ phone }) => phone !== undefined && phone.isValid());

  const sameCountryFirst = [
    ...parsed.filter(({ phone }) => phone?.country === defaultCountry),
    ...parsed.filter(({ phone }) => phone?.country !== defaultCountry),
  ];

  const kept: CleanPhone[] = [];
  const seen = new Set<string>();

  for (const { raw, phone } of sameCountryFirst) {
    if (phone === undefined) {
      continue;
    }

    const keys = [phone.number, lastTenDigits(raw), lastTenDigits(phone.number)];
    if (keys.some((key) => seen.has(key))) {
      continue;
    }
    keys.forEach((key) => seen.add(key));

    kept.push({
      number: phone.nationalNumber,
      countryCode: phone.country ?? '',
      callingCode: `+${phone.countryCallingCode}`,
    });
  }

  return kept.slice(0, MAX_PHONES);
};
