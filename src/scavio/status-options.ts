import { STATUS_OPTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { type EnrichmentStatus } from 'src/scavio/types';

const STATUS_META = [
  { value: 'QUEUED', label: 'Queued', color: 'gray' },
  { value: 'ENRICHED', label: 'Enriched', color: 'green' },
  { value: 'NO_CONTACTS', label: 'No contacts found', color: 'yellow' },
  { value: 'NO_WEBSITE', label: 'No website', color: 'gray' },
  { value: 'UNREACHABLE', label: 'Website unreachable', color: 'orange' },
  { value: 'OUT_OF_CREDITS', label: 'Out of Scavio credits', color: 'red' },
  { value: 'FAILED', label: 'Failed', color: 'red' },
] as const satisfies readonly { value: EnrichmentStatus; label: string; color: string }[];

export const STATUS_SELECT_OPTIONS = STATUS_META.map(
  ({ value, label, color }, position) => ({
    id: STATUS_OPTION_UNIVERSAL_IDENTIFIERS[value],
    value,
    label,
    color,
    position,
  }),
);
