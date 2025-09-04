import AuthLayout from "./AuthLayout";
import { useResendConfirmation, useSetPasswordWithToken } from "../hooks";
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
import { AppError, getUserMessage } from "../../../lib/error";

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

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const urlToken = params.get("token") || "";
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [token, setToken] = useState(urlToken);
  const [emailForResend, setEmailForResend] = useState("");
  
  const { mutateAsync: doSetPw, isPending } = useSetPasswordWithToken();
  const { mutateAsync: doResend, isPending: isResending } = useResendConfirmation();

  const [expiredOrInvalid, setExpiredOrInvalid] = useState(false);
  const [redirectIn, setRedirectIn] = useState(5);  

  const hasToken = useMemo(() => token.trim().length > 0, [token]);

  const {
    register,
    handleSubmit,
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

      const id = setInterval(() => {
        setRedirectIn((s) => {
          if (s <= 1) {
            clearInterval(id);
            navigate("/login", { replace: true });
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    } catch (e: unknown) {
      // const status = e?.response?.status;
      // const msg = e?.response?.data?.message || "Could not set password";
      // toast.error(msg);
      // if (status === 400 || status === 401 || /expired/i.test(msg)) {
      //   setExpiredOrInvalid(true);
      // }
      
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  };

  async function onResend() {
    if (!emailForResend.trim()) {
      toast.error("Enter your email to resend confirmation");
      setSuccessMsg("Verification email resent. Please check your inbox.");
      return;
    }
    try {
      await doResend(emailForResend.trim());
      toast.success("Verification email resent. Please check your inbox.");
    } catch (e: unknown) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
      toast.error(getUserMessage(err) || "Could not resend confirmation email")
    }
  }

  return (
    <AuthLayout title="Set your password" subtitle="Create a secure password to complete your email verification">
      <div className={errMsg ? 'w-full py-4 border-4 border-red-500 bg-black text-white text-center font-[600]' : 'hidden'}>{errMsg}</div>
      <div className={successMsg ? 'w-full py-4 border-4 border-green-500 bg-black text-white text-center font-[600]' : 'hidden'}>{successMsg}</div>      
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
            placeholder="Enter a strong password"
            {...register("password")}
          />
          <FieldErrorText error={errors.password} />
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
          {isSubmitting || isPending ? "Saving…" : "Save Password"}
        </Button>
      </form>

      <div className="mt-6 space-y-2">
        <p className="text-xs text-gray-500">Didn’t get an email? Resend the verification link.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="your@email.com"
            value={emailForResend}
            onChange={(e) => setEmailForResend(e.target.value)}
            className="sm:flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onResend}
            disabled={isResending}
            className="sm:w-[180px]"
          >
            {isResending ? "Sending…" : "Resend Verification Email"}
          </Button>
        </div>
      </div>

      {/* Success redirect hint */}
      {redirectIn < 4 && redirectIn > 0 && (
        <p className="mt-6 text-center text-sm text-green-700">
          Password saved. Redirecting to login in {redirectIn}s…
        </p>
      )}

      {/* Fallback link to login */}
      <div className="mt-6 text-center text-sm">
        <a className="text-primary hover:underline" href="/login">Back to login</a>
      </div>
    </AuthLayout>
  );
}
