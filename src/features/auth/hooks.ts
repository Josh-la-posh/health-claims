import { useMutation, useQuery } from "@tanstack/react-query";
import { login, register, requestPasswordReset, verifyEmail, fetchBrandColor, saveBrandColor, setPasswordWithToken, resendConfirmation, resetPassword } from "./api";
import { useAuthStore } from "../../store/auth";
import { queryClient } from "../../lib/queryClient";
import { useThemeStore } from "../../store/theme";
import type { LoginApiResponse, SetPasswordWithTokenPayload } from "../../types/auth";

export function useLogin() {
  const setSession = useAuthStore(s => s.setSession);
  // const setPrimaryHsl = useThemeStore(s => s.setPrimaryHsl);

  return useMutation({
    mutationFn: login,
    onSuccess: async (res: LoginApiResponse) => {
      const { accessToken, user } = res.responseData;
      setSession({ user: {
        id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, emailVerified: user.isEmailConfirmed
      }, accessToken });
      const color = await fetchBrandColor().catch(() => ({ hsl: null }));
      if (color?.hsl) useThemeStore.getState().setPrimaryHsl(color.hsl);
      await queryClient.invalidateQueries();
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