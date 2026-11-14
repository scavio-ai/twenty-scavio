const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//;
const LEADING_WWW_REGEX = /^www\./;
const HOST_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

// Twenty stores the company domain as a link, usually "https://acme.com".
// Returns the bare host, or undefined when it is not a usable host name.
export const normalizeDomain = (raw: unknown): string | undefined => {
  if (typeof raw !== 'string') {
    return undefined;
  }

  const host = raw
    .trim()
    .toLowerCase()
    .replace(SCHEME_REGEX, '')
    .split(/[/?#]/)[0]
    .split(':')[0]
    .replace(LEADING_WWW_REGEX, '');

  return HOST_REGEX.test(host) ? host : undefined;
};
