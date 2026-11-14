import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIERS.lastEnrichedAt,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'scavioLastEnrichedAt',
  label: 'Scavio Enriched At',
  description: "When Scavio last enriched this company.",
  icon: 'IconClock',
  isNullable: true,
});
