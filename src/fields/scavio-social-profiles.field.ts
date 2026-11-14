import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIERS.socialProfiles,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.LINKS,
  name: 'scavioSocialProfiles',
  label: 'Social Profiles',
  description: "Social profiles linked from the company's website.",
  icon: 'IconWorld',
  isNullable: true,
});
