import type {
  AuthCallbackRes,
  AuthLoginRes,
  AuthRefreshRes,
} from "@oktomusic/api-schemas";

import { apiClient } from "../client";

/**
 * Initiate OIDC login flow
 */
export async function login(): Promise<AuthLoginRes> {
  const response = await apiClient.get<AuthLoginRes>("/auth/login");
  return response.data;
}

/**
 * Handle OIDC callback after authentication
 */
export async function callback(
  code: string,
  state?: string,
): Promise<AuthCallbackRes> {
  const params = new URLSearchParams({ code });
  if (state) {
    params.append("state", state);
  }

  const response = await apiClient.get<AuthCallbackRes>(
    `/api/auth/callback?${params.toString()}`,
  );
  return response.data;
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<AuthRefreshRes> {
  const response = await apiClient.get<AuthRefreshRes>("/auth/refresh");
  return response.data;
}
