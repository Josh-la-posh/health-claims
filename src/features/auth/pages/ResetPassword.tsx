import AuthLayout from "../../../app/layouts/AuthLaoyout";
import { useResetPasswordWithToken, useForgotPassword } from "../hooks";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrorText } from "../../../components/ui/form";
import { Lock } from "lucide-react";
import { getUserMessage, type AppError } from "../../../lib/error";
import { useCooldown } from "../../../hooks/useCooldown";
import PasswordStrength from "../../../components/auth/PasswordStrength";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{7,24}$/;

const schema = z
  .object({
    password: z.string().regex(PWD_REGEX, "7–24 chars, one upper, one lower, one number, one special (!@#$%)"),
    confirmPassword: z.string(),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const urlToken = params.get("token") || "";
  const { left, start, active } = useCooldown(30);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [token, setToken] = useState(urlToken);
  const [emailForResend, setEmailForResend] = useState("");

  const { mutateAsync: doSetPw, isPending } = useResetPasswordWithToken();
  const { mutateAsync: doResend, isPending: isResending } = useForgotPassword();

  const [expiredOrInvalid, setExpiredOrInvalid] = useState(false);
  const [redirectIn, setRedirectIn] = useState(5);

  const hasToken = useMemo(() => token.trim().length > 0, [token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!urlToken) {
      setExpiredOrInvalid(true);
      return;
    }
    setToken(urlToken);
  }, [urlToken]);

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

  async function onSubmit(values: FormValues) {
    setErrMsg(null);
    setSuccessMsg(null);
    if (!hasToken) {
      toast.error("Invalid or missing token. Please use the link from your email.");
      setErrMsg("Invalid or missing token. Please use the link from your email.");
      return;
    }
    try {
      await doSetPw({ token: token.trim(), password: values.password, confirmPassword: values.confirmPassword });
      toast.success("Your password has been set. You can now sign in.");
      setSuccessMsg("Your password has been set. You can now sign in.");
      reset();
      setRedirectIn(5);
      setShowSuccessDialog(true);
    } catch (e: unknown) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  }

  async function onResend() {
    setErrMsg(null);
    setSuccessMsg(null);
    if (!emailForResend.trim()) {
      toast.error("Enter your email to resend confirmation");
      return;
    }
    try {
      await doResend(emailForResend.trim());
      setSuccessMsg("Reset email resent. Please check your inbox.");
      toast.success("Reset email resent. Please check your inbox.");
    } catch (e: unknown) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
      toast.error(getUserMessage(err) || "Could not resend confirmation email");
    }
  }

  return (
    <AuthLayout title="Set your password" subtitle="Create a secure password to complete your email verification">
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
          No token found in the link. Paste the token from your email to proceed.
        </div>
      )}
      {expiredOrInvalid && hasToken && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            Your link appears to be invalid or expired. You can request a new verification email below.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="hidden">
          <Input placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">New Password</label>
          <Input
            leftIcon={<Lock size={18} />}
            type="password"
            placeholder="Enter password"
            {...register("password")}
          />
          <FieldErrorText error={errors.password} />
          <PasswordStrength value={passwordValue} />
          <p className="mt-1 text-xs text-gray-500">
            7–24 chars, with upper, lower, number, and special (!@#$%)
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Confirm Password</label>
          <Input
            leftIcon={<Lock size={18} />}
            type="password"
            placeholder="Re-enter password"
            {...register("confirmPassword")}
          />
          <FieldErrorText error={errors.confirmPassword} />
        </div>

        <Button className="w-full" disabled={isSubmitting || isPending}>
          {isSubmitting || isPending ? "Saving…" : "Reset Password"}
        </Button>
      </form>

      <div className="mt-6 space-y-2">
        <p className="text-xs text-gray-500">Didn’t get an email? Resend the verification link.</p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
          <Input
            placeholder="your@email.com"
            value={emailForResend}
            onChange={(e) => setEmailForResend(e.target.value)}
            className="sm:flex-grow"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onResend();
              start();
            }}
            disabled={isResending || active}
            className="sm:w-[120px]"
          >
            {isResending ? "Sending…" : active ? `Resend Email in ${left}s` : "Resend Email"}
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm">
        <a className="text-primary hover:underline" href="/login">
          Back to login
        </a>
      </div>
    </AuthLayout>
  );
}
