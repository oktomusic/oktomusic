import type { ApiInfoRes } from "@oktomusic/api-schemas";

import { apiClient } from "../client";

export async function getInfo(): Promise<ApiInfoRes> {
  const res = await apiClient.get<ApiInfoRes>("/info", {});
  return res.data;
}
