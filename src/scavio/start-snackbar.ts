import { type EnqueueSnackbarParams } from 'twenty-sdk/front-component';

export type StartEnrichmentResult = {
  success: boolean;
  queued: number;
  noWebsite: number;
  notFound: number;
  message?: string;
};

const companies = (count: number) =>
  `${count} ${count === 1 ? 'company' : 'companies'}`;

export const buildStartSnackbar = (
  result: StartEnrichmentResult,
): EnqueueSnackbarParams => {
  if (!result.success) {
    return {
      message: result.message ?? 'Could not start the Scavio enrichment.',
      variant: 'error',
    };
  }

  if (result.queued === 0) {
    return {
      message: 'None of the selected companies has a website to enrich.',
      variant: 'warning',
    };
  }

  const skipped =
    result.noWebsite > 0 ? ` ${companies(result.noWebsite)} without a website skipped.` : '';

  return {
    message: `Enriching ${companies(result.queued)} in the background.${skipped}`,
    variant: result.noWebsite > 0 ? 'warning' : 'success',
    detailedMessage:
      'Results appear in the Scavio fields and the "Enriched (Scavio)" view as each company finishes.',
  };
};
