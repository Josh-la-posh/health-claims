import { api, api2, authApi } from '../../lib/axios';
import { useAuthStore } from '../../store/auth';
import { type ApiEnvelope, type Country, type LoginApiResponse, type LoginUser, type LoginPayload, type RegisterPayload, type RegisterResponseData, type SetPasswordWithTokenPayload } from "../../types/auth";

export async function login(payload: LoginPayload) {
  const { data } = await authApi.post<LoginApiResponse>("/", payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await authApi.post<ApiEnvelope<RegisterResponseData>>("/signup", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function requestPasswordReset(email: string) {
  const { data } = await authApi.put<ApiEnvelope<null>>("/reset-password", { email });
  return data;
}

export async function resetPassword(payload: SetPasswordWithTokenPayload) {
  const { data } = await authApi.put<ApiEnvelope<LoginUser>>("/password/reset", payload);
  return data;
}

export async function verifyEmail(token: string) {
  const { data } = await authApi.post<ApiEnvelope<null>>("/verify-email", { token });
  return data;
}

export async function resendConfirmation(email: string) {
  const { data } = await authApi.post<ApiEnvelope<null>>("/resend-confirm-account", { email });
  return data;
}

export async function setPasswordWithToken(payload: SetPasswordWithTokenPayload) {
  const { data } = await authApi.post<ApiEnvelope<null>>("/confirm-account", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
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
  const { data } = await api2.get("/country");
  if (data?.message !== "Successful") throw new Error("Failed to load countries");
  return data.responseData as Country[];
}

// --- User Profile ---
export type UpdateUserPayload = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
};

export type UpdateUserResponse = {
  data: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    roles: string[];
    isProvider: boolean;
  };
  message: string;
  isSuccess: boolean;
};

export async function updateUser(payload: UpdateUserPayload) {
  const { id, ...body } = payload;
  const { data } = await api.put<UpdateUserResponse>(`/users/${id}`, { id, ...body });
  // Update auth store user locally (assumes single name field)
  if (data?.data?.id) {
    const fullName = [data.data.firstName, data.data.lastName].filter(Boolean).join(' ').trim();
    useAuthStore.getState().setSession({
      user: {
        id: data.data.id,
        email: data.data.email,
        name: fullName,
        isProvider: data.data.isProvider,
        role: undefined, // role not returned directly; keep previous or handle separately
        providerId: undefined,
        hmoId: undefined,
      },
      accessToken: useAuthStore.getState().accessToken || ''
    });
  }
  return data;
}

// --- Change Password ---
export type ChangePasswordPayload = { currentPassword: string; newPassword: string };
export type ChangePasswordResponse = UpdateUserResponse; // same envelope

export async function changePassword(payload: ChangePasswordPayload){
  const { data } = await api.post<ChangePasswordResponse>("/users/change-password", payload);
  return data;
}

// export async function fetchIndustries() {
//   const { data } = await authApi2.get("/api/industry");
//   if (data?.message !== "Successful") throw new Error("Failed to load industries");
//   return data.responseData as Industry[];
// }

// export async function fetchIndustryCategories(industryId: number) {
//   const { data } = await authApi.get(`/api/industry/categories/${industryId}`);
//   if (data?.message !== "Successful") throw new Error("Failed to load categories");
//   return data.responseData as IndustryCategory[];
// }