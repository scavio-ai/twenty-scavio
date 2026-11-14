export type RecordInput = string | { id?: string | null } | null | undefined;

// Accepts what the command menu sends (an id list) and what a workflow
// "records" input holds (one record, or a list of records or ids).
export const extractRecordIds = (records: RecordInput | RecordInput[]): string[] => {
  const list = Array.isArray(records) ? records : [records];
  const ids = list
    .map((record) => (typeof record === 'string' ? record : record?.id))
    .filter((id): id is string => typeof id === 'string' && id.trim() !== '');

  return [...new Set(ids)];
};
