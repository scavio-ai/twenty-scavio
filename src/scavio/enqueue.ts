export type WorkerPayload = {
  companyIds: string[];
  rateLimitRetries: number;
};

export type EnqueueWorkers = (
  payloads: WorkerPayload[],
  options?: { delayMs?: number },
) => Promise<void>;
