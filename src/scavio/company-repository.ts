import { type CoreApiClient } from 'twenty-client-sdk/core';

export type CompanyRecord = {
  id: string;
  name?: string | null;
  domainName?: { primaryLinkUrl?: string | null } | null;
  linkedinLink?: { primaryLinkUrl?: string | null } | null;
  scavioEnrichmentStatus?: string | null;
};

export type CompanyRepository = {
  read: (ids: string[]) => Promise<CompanyRecord[]>;
  update: (id: string, data: Record<string, unknown>) => Promise<void>;
  updateMany: (ids: string[], data: Record<string, unknown>) => Promise<void>;
};

const PAGE_SIZE = 200;

export const createCompanyRepository = (client: CoreApiClient): CompanyRepository => ({
  read: async (ids) => {
    const records: CompanyRecord[] = [];

    for (let start = 0; start < ids.length; start += PAGE_SIZE) {
      const page = ids.slice(start, start + PAGE_SIZE);
      const result = (await client.query({
        companies: {
          __args: { filter: { id: { in: page } }, first: page.length },
          edges: {
            node: {
              id: true,
              name: true,
              domainName: { primaryLinkUrl: true },
              linkedinLink: { primaryLinkUrl: true },
              scavioEnrichmentStatus: true,
            },
          },
        },
      })) as { companies?: { edges?: { node?: CompanyRecord }[] } };

      for (const edge of result.companies?.edges ?? []) {
        if (edge?.node?.id) {
          records.push(edge.node);
        }
      }
    }

    return records;
  },
  update: async (id, data) => {
    await client.mutation({
      updateCompany: { __args: { id, data }, id: true },
    });
  },
  updateMany: async (ids, data) => {
    for (let start = 0; start < ids.length; start += PAGE_SIZE) {
      await client.mutation({
        updateCompanies: {
          __args: { filter: { id: { in: ids.slice(start, start + PAGE_SIZE) } }, data },
          id: true,
        },
      });
    }
  },
});
