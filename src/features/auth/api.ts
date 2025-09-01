import { api, authApi } from "../../lib/axios";
import type { LoginApiResponse, LoginPayload, RegisterPayload } from "../../types/auth";

export async function login(payload: LoginPayload) {
  const { data } = await authApi.post<LoginApiResponse>("/Account", payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function requestPasswordReset(email: string) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function verifyEmail(token: string) {
  const { data } = await api.post("/auth/verify-email", { token });
  return data;
}

/** Save merchant brand color (HSL) */
export async function saveBrandColor(hsl: string) {
  const { data } = await api.patch("/settings/brand-color", { hsl });
  return data;
}

/** Load brand color on login */
export async function fetchBrandColor() {
  const { data } = await api.get("/settings/brand-color");
  return data as { hsl: string | null };
}
