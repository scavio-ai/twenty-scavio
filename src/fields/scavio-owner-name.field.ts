import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIERS.ownerName,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.TEXT,
  name: 'scavioOwnerName',
  label: 'Owner Name',
  description: "Owner or founder named on the website or a linked profile.",
  icon: 'IconUserCircle',
  isNullable: true,
});
