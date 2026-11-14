import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIERS.contactPage,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.LINKS,
  name: 'scavioContactPage',
  label: 'Contact Page',
  description: "The company's contact page.",
  icon: 'IconAddressBook',
  isNullable: true,
});
