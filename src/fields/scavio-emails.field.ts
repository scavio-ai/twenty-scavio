import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIERS.emails,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.EMAILS,
  name: 'scavioEmails',
  label: 'Website Emails',
  description: "Emails published on the company's website.",
  icon: 'IconMail',
  isNullable: true,
});
