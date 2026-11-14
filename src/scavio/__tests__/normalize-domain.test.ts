import { describe, expect, it } from 'vitest';

import { normalizeDomain } from 'src/scavio/normalize-domain';

describe('normalizeDomain', () => {
  it.each([
    ['https://www.Acme.com/', 'acme.com'],
    ['acme.com', 'acme.com'],
    ['http://shop.acme.co.uk:8080/path?q=1', 'shop.acme.co.uk'],
    ['  www.acme.io  ', 'acme.io'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected);
  });

  it.each([[''], ['localhost'], ['not a domain'], [null], [undefined], [42]])(
    'rejects %s',
    (input) => {
      expect(normalizeDomain(input)).toBeUndefined();
    },
  );
});
