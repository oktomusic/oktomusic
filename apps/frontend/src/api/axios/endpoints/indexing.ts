import type {
  IndexingTriggerRes,
  IndexingStatusRes,
} from "@oktomusic/api-schemas";

import { apiClient } from "../client";

export async function triggerIndexing(): Promise<IndexingTriggerRes> {
  const res = await apiClient.post<IndexingTriggerRes>("/indexing/trigger");
  return res.data;
}

export async function getIndexingStatus(
  jobId: string,
): Promise<IndexingStatusRes> {
  const res = await apiClient.get<IndexingStatusRes>(
    `/indexing/status/${jobId}`,
  );
  return res.data;
}
