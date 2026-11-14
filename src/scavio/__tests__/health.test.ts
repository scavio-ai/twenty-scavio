import { describe, expect, it } from 'vitest';

import { buildHealthResult } from 'src/scavio/health';
import { extractRecordIds } from 'src/scavio/record-ids';
import { buildStartSnackbar } from 'src/scavio/start-snackbar';

describe('buildHealthResult', () => {
  it('covers missing, rejected, unreachable, empty and healthy keys', () => {
    expect(buildHealthResult(null)).toMatchObject({ status: 'INFO' });
    expect(buildHealthResult({ kind: 'auth' })).toMatchObject({ status: 'ERROR' });
    expect(buildHealthResult({ kind: 'error' })).toMatchObject({ status: 'WARNING' });
    expect(buildHealthResult({ kind: 'ok', creditBalance: 5 })).toMatchObject({ status: 'WARNING' });
    expect(buildHealthResult({ kind: 'ok', creditBalance: 50 })).toEqual({ status: 'OK' });
    expect(buildHealthResult({ kind: 'ok', creditBalance: null })).toEqual({ status: 'OK' });
  });
});

describe('extractRecordIds', () => {
  it('reads ids from strings, records and single values, deduped', () => {
    expect(extractRecordIds(['a', { id: 'b' }, { id: null }, 'a', ''])).toEqual(['a', 'b']);
    expect(extractRecordIds({ id: 'c' })).toEqual(['c']);
    expect(extractRecordIds(undefined)).toEqual([]);
  });
});

describe('buildStartSnackbar', () => {
  it('words the counts', () => {
    expect(buildStartSnackbar({ success: true, queued: 1, noWebsite: 0, notFound: 0 }).message)
      .toBe('Enriching 1 company in the background.');
    expect(buildStartSnackbar({ success: true, queued: 3, noWebsite: 2, notFound: 0 })).toMatchObject({
      message: 'Enriching 3 companies in the background. 2 companies without a website skipped.',
      variant: 'warning',
    });
    expect(buildStartSnackbar({ success: true, queued: 0, noWebsite: 2, notFound: 0 }).variant)
      .toBe('warning');
    expect(buildStartSnackbar({ success: false, queued: 0, noWebsite: 0, notFound: 0, message: 'No key' }))
      .toMatchObject({ message: 'No key', variant: 'error' });
  });
});
