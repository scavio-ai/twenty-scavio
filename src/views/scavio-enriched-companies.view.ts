import {
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewType,
} from 'twenty-sdk/define';

import {
  FIELD_UNIVERSAL_IDENTIFIERS,
  VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
  VIEW_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

const companyFields = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.fields;

const COLUMNS = [
  companyFields.name.universalIdentifier,
  companyFields.domainName.universalIdentifier,
  FIELD_UNIVERSAL_IDENTIFIERS.status,
  FIELD_UNIVERSAL_IDENTIFIERS.emails,
  FIELD_UNIVERSAL_IDENTIFIERS.phones,
  FIELD_UNIVERSAL_IDENTIFIERS.ownerName,
  FIELD_UNIVERSAL_IDENTIFIERS.ownerTitle,
  FIELD_UNIVERSAL_IDENTIFIERS.ownerEmail,
  FIELD_UNIVERSAL_IDENTIFIERS.socialProfiles,
  FIELD_UNIVERSAL_IDENTIFIERS.contactPage,
  companyFields.linkedinLink.universalIdentifier,
  FIELD_UNIVERSAL_IDENTIFIERS.note,
  FIELD_UNIVERSAL_IDENTIFIERS.lastEnrichedAt,
];

export default defineView({
  universalIdentifier: VIEW_UNIVERSAL_IDENTIFIERS.enrichedCompanies,
  name: 'Enriched (Scavio)',
  icon: 'IconSparkles',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: ViewType.TABLE,
  fields: COLUMNS.map((fieldMetadataUniversalIdentifier, position) => ({
    universalIdentifier: VIEW_FIELD_UNIVERSAL_IDENTIFIERS[position],
    fieldMetadataUniversalIdentifier,
    position,
    isVisible: true,
  })),
});
