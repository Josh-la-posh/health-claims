import AuthLayout from "../../../app/layouts/AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Mail } from "lucide-react";
import { useForgotPassword } from "../hooks";
import { getUserMessage, type AppError } from "../../../lib/error";
import { useState } from "react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../../../utils";
import { useFieldControl } from "../../../hooks/useFieldState";

export default function ForgotPassword() {
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { mutateAsync, isPending } = useForgotPassword();
  const { register, handleSubmit, watch, formState: { errors, touchedFields } } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setErrMsg(null);
    setSuccessMsg(null);
    try {
      const response = await mutateAsync(values.email);
      setSuccessMsg(response?.data || "Password reset link sent to your email");
    } catch (e) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  };

  const email = useFieldControl("email", errors, touchedFields, watch("email"));

  return (
    <AuthLayout title="Reset your password">
      <div className={errMsg ? 'w-full py-4 border-4 border-red-500 bg-black text-white text-center font-[600]' : 'hidden'}>{errMsg}</div>
      <div className={successMsg ? 'w-full py-4 border-4 border-primary bg-black text-white text-center font-[600]' : 'hidden'}>{successMsg}</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail size={18} />}
            placeholder="Email"
            helper={email.errorMessage || "Must be a valid email address"}
            id="email"
            state={email.state}
            {...register("email")}
          />
        </div>
        <Button
          disabled={isPending}
          isLoading={isPending}
          loadingText="Sending…"
          className="w-full"
        >
          Send reset link
        </Button>
      </form>

      {/* Fallback link to login */}
      <div className="mt-6 text-center text-sm">
        <a className="text-primary hover:underline" href="/login">Back to login</a>
      </div>
    </AuthLayout>
  );
}
