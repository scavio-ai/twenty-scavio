import { cleanEmails, cleanPhones } from 'src/scavio/clean-contacts';
import {
  type EnrichmentStatus,
  type ScavioCompanyData,
  type SocialNetwork,
} from 'src/scavio/types';

export type ExistingCompanyLinks = {
  linkedinLink?: { primaryLinkUrl?: string | null } | null;
};

const SOCIAL_ORDER: { network: SocialNetwork; label: string }[] = [
  { network: 'linkedin', label: 'LinkedIn' },
  { network: 'facebook', label: 'Facebook' },
  { network: 'instagram', label: 'Instagram' },
  { network: 'x', label: 'X' },
  { network: 'youtube', label: 'YouTube' },
  { network: 'tiktok', label: 'TikTok' },
  { network: 'pinterest', label: 'Pinterest' },
];

const isHttpUrl = (value: unknown): value is string =>
  typeof value === 'string' && /^https?:\/\/\S+$/i.test(value.trim());

const link = (url: string, label = '') => ({
  primaryLinkUrl: url,
  primaryLinkLabel: label,
  secondaryLinks: null,
});

const isEmptyLink = (value: { primaryLinkUrl?: string | null } | null | undefined) =>
  !value || !value.primaryLinkUrl || value.primaryLinkUrl.trim() === '';

const textOrNull = (value: unknown, max = 200): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, max) : null;

// Turns one enrich response into the fields written to the Company record.
// Scavio fields are replaced on every run that finds something for them;
// a field the run found nothing for keeps its previous value. The standard
// LinkedIn field is only filled when it is empty.
export const buildCompanyUpdate = ({
  data,
  domain,
  existing,
  now,
}: {
  data: ScavioCompanyData;
  domain: string;
  existing: ExistingCompanyLinks;
  now: string;
}): { status: EnrichmentStatus; update: Record<string, unknown> } => {
  const company = data.company;
  const update: Record<string, unknown> = {};

  const emails = cleanEmails(company.emails, domain);
  if (emails.length > 0) {
    update.scavioEmails = {
      primaryEmail: emails[0],
      additionalEmails: emails.length > 1 ? emails.slice(1) : null,
    };
  }

  const phones = cleanPhones(company.phones, domain);
  if (phones.length > 0) {
    const [primary, ...rest] = phones;
    update.scavioPhones = {
      primaryPhoneNumber: primary.number,
      primaryPhoneCountryCode: primary.countryCode,
      primaryPhoneCallingCode: primary.callingCode,
      additionalPhones: rest.length > 0 ? rest : null,
    };
  }

  const socials = SOCIAL_ORDER
    .map(({ network, label }) => ({ url: company.socials?.[network], label, network }))
    .filter((social): social is { url: string; label: string; network: SocialNetwork } =>
      isHttpUrl(social.url),
    );

  if (socials.length > 0) {
    const [first, ...rest] = socials;
    update.scavioSocialProfiles = {
      primaryLinkUrl: first.url,
      primaryLinkLabel: first.label,
      secondaryLinks:
        rest.length > 0 ? rest.map(({ url, label }) => ({ url, label })) : null,
    };
  }

  const linkedin = socials.find((social) => social.network === 'linkedin');
  if (linkedin && isEmptyLink(existing.linkedinLink)) {
    update.linkedinLink = link(linkedin.url);
  }

  if (isHttpUrl(company.contact_page)) {
    update.scavioContactPage = link(company.contact_page);
  }

  const owner = data.owner;
  const ownerName = textOrNull(owner?.name);
  if (owner && ownerName) {
    update.scavioOwnerName = ownerName;
    update.scavioOwnerTitle = textOrNull(owner.title);

    const [ownerEmail] = cleanEmails(owner.email ? [owner.email] : [], domain);
    update.scavioOwnerEmail = ownerEmail
      ? { primaryEmail: ownerEmail, additionalEmails: null }
      : { primaryEmail: '', additionalEmails: null };
  }

  const foundSomething =
    emails.length > 0 || phones.length > 0 || socials.length > 0 ||
    ownerName !== null || isHttpUrl(company.contact_page);

  const status: EnrichmentStatus = foundSomething ? 'ENRICHED' : 'NO_CONTACTS';

  update.scavioEnrichmentStatus = status;
  update.scavioLastEnrichedAt = now;
  update.scavioEnrichmentNote = foundSomething
    ? owner && ownerName && isHttpUrl(owner.source_url)
      ? `Owner found on ${owner.source_url}`
      : null
    : `Read ${data.pages_read?.length ?? 0} page(s) of ${domain}; no published contact details found.`;

  return { status, update };
};
