import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it } from 'vitest';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  START_ENRICHMENT_ROUTE_PATH,
} from 'src/constants/universal-identifiers';
import { MISSING_KEY_MESSAGE } from 'src/scavio/start-enrichment';

// These tests never set a Scavio key, so they make no call to Scavio and
// spend no credits. The enrichment path itself is covered by unit tests.
const findApplicationId = async (): Promise<string> => {
  const result = await new MetadataApiClient().query({
    findManyApplications: { id: true, universalIdentifier: true },
  });
  const application = result.findManyApplications.find(
    (app: { universalIdentifier: string }) =>
      app.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
  );

  if (!application) {
    throw new Error('Scavio app is not installed');
  }

  return application.id;
};

describe('Scavio Company Enrichment app', () => {
  it('is installed and adds its fields to Company', async () => {
    await findApplicationId();

    const result = (await new CoreApiClient().query({
      companies: {
        __args: { first: 1 },
        edges: {
          node: {
            id: true,
            scavioEnrichmentStatus: true,
            scavioEmails: { primaryEmail: true },
            scavioPhones: { primaryPhoneNumber: true },
            scavioSocialProfiles: { primaryLinkUrl: true },
            scavioOwnerName: true,
          },
        },
      },
    })) as { companies?: unknown };

    expect(result.companies).toBeDefined();
  });

  it('asks for a key in the health check before one is set', async () => {
    const applicationId = await findApplicationId();
    const response = await fetch(`${process.env.TWENTY_API_URL}/metadata`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation { runApplicationHealthCheck(applicationId: "${applicationId}") { title } }`,
      }),
    });
    const body = (await response.json()) as {
      data?: { runApplicationHealthCheck?: { title?: string } };
    };

    expect(body.data?.runApplicationHealthCheck?.title).toBe(
      'Add your Scavio API key to start enriching companies',
    );
  });

  it('refuses to start without a key and changes no record', async () => {
    const response = await fetch(
      `${process.env.TWENTY_API_URL}/s${START_ENRICHMENT_ROUTE_PATH}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordIds: [] }),
      },
    );

    expect(await response.json()).toEqual({
      success: false,
      queued: 0,
      noWebsite: 0,
      notFound: 0,
      message: MISSING_KEY_MESSAGE,
    });
  });
});
