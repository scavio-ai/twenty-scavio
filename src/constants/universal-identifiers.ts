export const APP_DISPLAY_NAME = 'Scavio Company Enrichment';
export const APP_DESCRIPTION =
  "Fill company emails, phones, social links and the owner's name from each company's own website.";
export const APPLICATION_UNIVERSAL_IDENTIFIER = '7df36bb6-a3f3-41cd-a955-242b9508e63c';
export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER = '2744af0c-2361-48bd-9b9a-7cafffd5e372';
export const HEALTH_CHECK_UNIVERSAL_IDENTIFIER = '09069cc5-52c1-413e-9db9-8e752a9d3341';

export const APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS = {
  apiKey: 'ca192689-bab1-4351-b474-e485aac44e52',
  parallelRequests: '42152366-d912-4d23-be7a-cfe7d43eb69e',
} as const;

export const FIELD_UNIVERSAL_IDENTIFIERS = {
  status: '98fb6be3-8f51-4dbb-b876-1bc62c95c4d3',
  lastEnrichedAt: 'a077d5f5-926e-4f57-96a3-d22fcbae43d7',
  note: '23600ea9-402a-45e4-9248-f16e6e197355',
  emails: 'c9f715e9-b113-47f4-9a5d-d9f0853f6c43',
  phones: '2ba91ee1-1ef5-4a8d-bb90-604e463a9cbf',
  socialProfiles: '606f5b14-a5d6-46b4-b7fc-5fa3a28dee5e',
  contactPage: 'a279c392-b8fc-4356-a292-d2ca7d5152d4',
  ownerName: '27540976-1871-4a57-acb7-24014f6c001f',
  ownerTitle: 'bc4f4923-4a48-45d1-a4a8-4b8357a3ea38',
  ownerEmail: 'c81344e1-1937-467b-8d22-9c1b62f2ecf0',
} as const;

export const STATUS_OPTION_UNIVERSAL_IDENTIFIERS = {
  QUEUED: 'c529b9b0-c0c9-4e72-9d14-d8495c0541de',
  ENRICHED: '9082d22e-59c4-42fb-8cdd-e645e569691d',
  NO_CONTACTS: '9671c0c3-75b2-4849-98df-2bc51e1a1fe1',
  NO_WEBSITE: '256b1d94-0b8d-4977-b7c2-611cd202adf3',
  UNREACHABLE: 'a20d585a-44eb-4c33-b25f-4f6fb16b2b0a',
  OUT_OF_CREDITS: 'cc92beb9-b0d6-4192-bdb0-b85186f319dc',
  FAILED: '157606a3-650b-486f-b3ed-8dadd11edab2',
} as const;

export const LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS = {
  startEnrichment: '3299b3b9-f0cd-4ed8-aa81-5ec2b4650606',
  enrichWorker: 'd677dd12-557a-4a33-b285-d360b879ebdd',
} as const;

export const START_ENRICHMENT_ROUTE_PATH = '/scavio/enrich-companies';

export const FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS = {
  enrichCompanies: '849a48f1-ea4f-4dd7-96cb-e8ffc052a680',
} as const;

export const COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = {
  enrichCompanies: '848126d6-e2b1-4945-b98d-3a65b8c509f2',
} as const;

export const VIEW_UNIVERSAL_IDENTIFIERS = {
  enrichedCompanies: '35144e37-dfb9-4f74-86be-bf1d742af89d',
} as const;

export const VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  'acc2c551-7b71-4f7e-b7bf-fc61c46ec4bb',
  '7dc92834-12fe-4a62-837b-e60c97addb1f',
  'c9a82904-585e-4a70-b3a6-c53f7e9b5d16',
  '415f78b3-fd86-40bf-9a2e-74f073b5b155',
  '4ee8572d-1aff-44d0-bb88-919d2bb85215',
  '9e087fdd-f0f2-4121-9fdb-ff688970159c',
  '1613ec1a-7025-45a3-8aa7-3924cd28cfed',
  'daa2e49d-bd8e-4b69-8111-05eebce8166a',
  'b236d8e6-811b-44bc-9eda-bd9aad7db3ba',
  '96352d1e-9d9c-4e5d-9d8e-2439e2b2ed20',
  'a5617744-b3ff-4eef-9189-5d517354a91b',
  'ec16f4a3-ef46-4c07-9bc8-50578249566b',
  '01c9c4b1-ecbc-4c11-9db0-066ac84d09d9',
] as const;
