import { api, authApi } from '../../lib/axios';
import { type ApiEnvelope, type Country, type Industry, type IndustryCategory, type LoginApiResponse, type LoginPayload, type RegisterPayload, type RegisterResponseData, type SetPasswordWithTokenPayload } from "../../types/auth";

export async function login(payload: LoginPayload) {
  const { data } = await authApi.post<LoginApiResponse>("/account", payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await authApi.post<ApiEnvelope<RegisterResponseData>>("/onboard-merchant", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function requestPasswordReset(email: string) {
  const { data } = await authApi.post("/account/forget-password", { email });
  return data;
}

export async function resetPassword(payload: SetPasswordWithTokenPayload) {
  const { data } = await authApi.post("/account/reset-password", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data as { message?: string };
}

export async function verifyEmail(token: string) {
  const { data } = await authApi.post("/account/verify-email", { token });
  return data as { message?: string };
}

export async function resendConfirmation(email: string) {
  const { data } = await authApi.post("/account/resend-confirm-account", { email });
  return data as { message?: string };
}

export async function setPasswordWithToken(payload: SetPasswordWithTokenPayload) {
  const { data } = await authApi.post("/account/confirm-account", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data as { message?: string };
}

export async function saveBrandColor(hsl: string) {
  const { data } = await api.patch("/settings/brand-color", { hsl });
  return data;
}

export async function fetchBrandColor() {
  const { data } = await api.get("/settings/brand-color");
  return data as { hsl: string | null };
}

export async function fetchCountries() {
  const { data } = await authApi.get("/api/country");
  if (data?.message !== "Successful") throw new Error("Failed to load countries");
  return data.responseData as Country[];
}

export async function fetchIndustries() {
  const { data } = await authApi.get("/api/industry");
  if (data?.message !== "Successful") throw new Error("Failed to load industries");
  return data.responseData as Industry[];
}

export async function fetchIndustryCategories(industryId: number) {
  const { data } = await authApi.get(`/api/industry/categories/${industryId}`);
  if (data?.message !== "Successful") throw new Error("Failed to load categories");
  return data.responseData as IndustryCategory[];
}