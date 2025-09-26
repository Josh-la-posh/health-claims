import { useMutation } from "@tanstack/react-query";
import { login, register, requestPasswordReset, verifyEmail, fetchBrandColor, saveBrandColor, setPasswordWithToken, resendConfirmation, resetPassword, updateUser, type UpdateUserPayload, type UpdateUserResponse, changePassword, type ChangePasswordPayload, type ChangePasswordResponse } from "./api";
import { useAuthStore } from "../../store/auth";
import { queryClient } from "../../lib/queryClient";
import { useThemeStore } from "../../store/theme";
import type { LoginApiResponse, SetPasswordWithTokenPayload } from "../../types/auth";
import type { AppError } from "../../lib/error";
import { toast } from "sonner";

export function useLogin() {
  const setSession = useAuthStore(s => s.setSession);
  // const setPrimaryHsl = useThemeStore(s => s.setPrimaryHsl);

  return useMutation({
    mutationFn: login,
    onSuccess: async (res: LoginApiResponse) => {
      const user = res.data;
      let hmoId = user.hmoId || null;
      if (!hmoId && user.token) {
        try {
          const [, payload] = user.token.split(".");
          const json = JSON.parse(atob(payload));
            if (typeof json.HMOId === "string" && json.HMOId.trim()) hmoId = json.HMOId;
        } catch {
          // ignore decode issues
        }
      }
      setSession({ user: {
        id: user.id,
        email: user.emailAddress,
        name: user.fullName,
        emailVerified: true, // Assuming logged in users are verified
        role: user.role,
  hmoId,
        isProvider: user.isProvider,
        providerId: user.providerId || null,
      }, accessToken: user.token });
      const color = await fetchBrandColor().catch(() => ({ hsl: null }));
      if (color?.hsl) useThemeStore.getState().setPrimaryHsl(color.hsl);
      await queryClient.invalidateQueries();
    },
    onError: (e) => {
      const err = e as AppError;
      // avoid leaking raw errors in production logs
      // debug logging omitted to avoid leaking details in local logs
      if (err.code === "BAD_REQUEST") {
        toast.error("Invalid email or password");
      } else {
        toast.error(err.message || 'Unable to sign in');
      }
    }
  });
}

export function useRegister() {
  return useMutation({ mutationFn: register });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => requestPasswordReset(email) });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: (token: string) => verifyEmail(token) });
}

export function useResendConfirmation() {
  return useMutation({
    mutationFn: (email: string) => resendConfirmation(email),
  });
}

export function useSetPasswordWithToken() {
  return useMutation({
    mutationFn: (payload: SetPasswordWithTokenPayload) => setPasswordWithToken(payload),
  });
}

export function useResetPasswordWithToken() {
  return useMutation({
    mutationFn: (payload: SetPasswordWithTokenPayload) => resetPassword(payload),
  });
}

export function useSaveBrandColor() {
  return useMutation({ mutationFn: saveBrandColor, onSuccess: () => queryClient.invalidateQueries() });
}

export function useUpdateUser(){
  return useMutation<UpdateUserResponse, Error, UpdateUserPayload>({
    mutationFn: updateUser,
    onSuccess: (res) => {
      if(res.isSuccess){
        toast.success(res.message || 'Profile updated');
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update profile');
    }
  });
}

export function useChangePassword(){
  return useMutation<ChangePasswordResponse, Error, ChangePasswordPayload>({
    mutationFn: changePassword,
    onSuccess: (res) => {
      if(res.isSuccess){
        toast.success(res.message || 'Password changed');
      } else {
        toast.error(res.message || 'Failed to change password');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to change password');
    }
  });
}