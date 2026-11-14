import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { STATUS_SELECT_OPTIONS } from 'src/scavio/status-options';

export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIERS.status,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.SELECT,
  name: 'scavioEnrichmentStatus',
  label: 'Scavio Status',
  description: "Outcome of the latest Scavio enrichment.",
  icon: 'IconProgressCheck',
  isNullable: true,
  options: STATUS_SELECT_OPTIONS,
});
