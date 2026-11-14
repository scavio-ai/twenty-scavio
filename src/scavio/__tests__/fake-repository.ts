import { type CompanyRecord, type CompanyRepository } from 'src/scavio/company-repository';

export const createFakeRepository = (companies: CompanyRecord[]) => {
  const records = new Map(companies.map((company) => [company.id, { ...company } as Record<string, unknown>]));
  const writes: { ids: string[]; data: Record<string, unknown> }[] = [];

  const repository: CompanyRepository = {
    read: async (ids) =>
      ids.flatMap((id) => (records.has(id) ? [records.get(id) as CompanyRecord] : [])),
    update: async (id, data) => {
      writes.push({ ids: [id], data });
      records.set(id, { ...records.get(id), ...data });
    },
    updateMany: async (ids, data) => {
      writes.push({ ids, data });
      ids.forEach((id) => records.set(id, { ...records.get(id), ...data }));
    },
  };

  return { repository, records, writes };
};
