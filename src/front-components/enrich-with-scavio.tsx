import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Command,
  enqueueSnackbar,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import {
  FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS,
  START_ENRICHMENT_ROUTE_PATH,
} from 'src/constants/universal-identifiers';
import {
  buildStartSnackbar,
  type StartEnrichmentResult,
} from 'src/scavio/start-snackbar';

const execute = async (recordIds: string[]) => {
  try {
    const result = await new RestApiClient().post<StartEnrichmentResult>(
      `/s${START_ENRICHMENT_ROUTE_PATH}`,
      { recordIds },
    );

    await enqueueSnackbar(buildStartSnackbar(result));
  } catch {
    await enqueueSnackbar({
      message: 'Could not start the Scavio enrichment.',
      variant: 'error',
    });
  }
};

const EnrichWithScavio = () => {
  const recordIds = useSelectedRecordIds();

  return <Command execute={() => execute(recordIds)} />;
};

export default defineFrontComponent({
  universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.enrichCompanies,
  name: 'enrich-with-scavio',
  description: 'Starts a Scavio enrichment for the selected companies.',
  component: EnrichWithScavio,
  isHeadless: true,
});
