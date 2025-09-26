import AuthLayout from "../../../app/layouts/AuthLayout";
import { useResetPasswordWithToken } from "../hooks";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { getUserMessage, type AppError } from "../../../lib/error";
import PasswordStrength from "../../../components/auth/PasswordStrength";
import { resetPasswordSchema, type ResetPasswordInput } from "../../../utils";
import { useFieldControl } from "../../../hooks/useFieldState";
import { useAuthStore } from "../../../store/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Extract the token exactly as it appears (URL-encoded) so backend validation succeeds.
  // We cannot rely on useSearchParams() because it auto-decodes reserved characters (+, /, etc.).
  const rawToken = useMemo(() => {
    const search = window.location.search;
    const match = search.match(/[?&]token=([^&]+)/);
    return match ? match[1] : "";
  }, []);

  const urlEmail = params.get("email") || "";
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [emailForResend, setEmailForResend] = useState(urlEmail);

  const { mutateAsync: doSetPw, isPending } = useResetPasswordWithToken();
  const setSession = useAuthStore(s => s.setSession);

  // Derived flags / computed values
  const expiredOrInvalid = useMemo(() => !rawToken, [rawToken]);
  const [redirectIn, setRedirectIn] = useState(5);
  const hasToken = useMemo(() => rawToken.trim().length > 0, [rawToken]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, touchedFields },
    reset,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Keep email in sync if it changes (unlikely, but safe for navigation between reset links)
  useEffect(() => {
    if (urlEmail) setEmailForResend(urlEmail);
  }, [urlEmail]);

  const passwordValue = watch("password") || "";

  // Handle countdown + redirect after success dialog opens
  useEffect(() => {
    if (!showSuccessDialog) return;
    if (redirectIn <= 0) {
      navigate("/login", { replace: true });
      return;
    }
    const id = setTimeout(() => setRedirectIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [showSuccessDialog, redirectIn, navigate]);

  async function onSubmit(values: ResetPasswordInput) {
    setErrMsg(null);
    setSuccessMsg(null);
    if (!hasToken) {
      toast.error("Invalid or missing token. Please use the link from your email.");
      setErrMsg("Invalid or missing token. Please use the link from your email.");
      return;
    }
    try {
      const payload = { 
        email: emailForResend.trim(), 
        token: rawToken.trim(), 
        password: values.password, 
        confirmPassword: values.confirmPassword 
      };
      
      const response = await doSetPw(payload);

      if (response.isSuccess === true) {
        // Always show the dialog with countdown; defer navigation.
        if (response.data) {
          // Optionally keep auto-login but still show dialog (commented out for clarity)
          const user = response.data;
          setSession({ 
            user: {
              id: user.id, 
              email: user.emailAddress, 
              name: user.fullName, 
              emailVerified: true
            }, 
            accessToken: user.token 
          });
        }
        toast.success("Password reset successful.");
        setSuccessMsg("Your password has been reset successfully.");
        reset();
        setRedirectIn(5);
        setShowSuccessDialog(true);
      } else {
        setErrMsg(response.message || "Could not reset password. Please try again.");
        toast.error(response.message || "Could not reset password. Please try again.");
      }
      
    } catch (e: unknown) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  }
  
    const password = useFieldControl("password", errors, touchedFields, watch("password"));
    const confirmPassword = useFieldControl("confirmPassword", errors, touchedFields, watch("confirmPassword"));

  return (
    <AuthLayout title="Reset Password">
      <div className={errMsg ? "w-full py-4 border-4 border-red-500 bg-black text-white text-center font-[600]" : "hidden"}>
        {errMsg}
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-900">
            <h2 className="text-lg font-semibold mb-2 text-primary">Password Updated</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {successMsg || "Your password has been saved successfully."}
            </p>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Redirecting to login in {redirectIn}s…
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  setShowSuccessDialog(false);
                  navigate("/login", { replace: true });
                }}
              >
                Go to Login Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {!hasToken && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No token found in the link. Use the resend button to request a new one.
        </div>
      )}
      {expiredOrInvalid && hasToken && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            Your link appears to be invalid or expired. You can request a new verification email below.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden token input removed: token is taken from URL only to prevent tampering */}
        <div>
          <Input
            label="New Password"
            leftIcon={<Lock size={18} />}
            type="password"
            placeholder="Enter password"
            helper={password.errorMessage || "3–50 chars; letters, numbers, spaces, - and ' only"}
            id="password"
            state={password.state}
            {...register("password")}
          />
          <PasswordStrength value={passwordValue} />
          <p className="mt-1 text-xs text-gray-500">
            7–24 chars, with upper, lower, number, and special (!@#$%)
          </p>
        </div>

        <div>
          <Input
            label="Confirm Password"
            leftIcon={<Lock size={18} />}
            type="password"
            placeholder="Re-enter password"
            helper={confirmPassword.errorMessage || "3–50 chars; letters, numbers, spaces, - and ' only"}
            id="confirmPassword"
            state={confirmPassword.state}
            {...register("confirmPassword")}
          />
        </div>

        <Button
          className="w-full mt-8"
          disabled={isSubmitting || isPending}
          isLoading={isSubmitting || isPending}
          loadingText="Sending…"
        >
          Submit
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <a className="text-primary hover:underline" href="/login">
          Back to login
        </a>
      </div>
    </AuthLayout>
  );
}
