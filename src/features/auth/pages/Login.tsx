import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "../../../app/layouts/AuthLayout";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FieldErrorText } from "../../../components/ui/form";
import { Mail, Lock } from "lucide-react";
import { useLogin } from "../hooks";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/auth";
import { toast } from "sonner";
import { getUserMessage, type AppError } from "../../../lib/error";
import { useState } from "react";
import { loginSchema, type LoginInput } from "../../../utils";
import { useFieldControl } from "../../../hooks/useFieldState";

export default function Login() {
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const { mutateAsync, isPending } = useLogin();
  const navigate = useNavigate();
  const consumeIntended = useAuthStore(s => s.consumeIntendedRoute);

  const { register, handleSubmit, watch, formState: { errors, touchedFields } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginInput) => {
    setErrMsg(null);
    try {
  await mutateAsync(values);
  const intended = consumeIntended();
  // Re-read user after mutation (session now set)
  const currentUser = useAuthStore.getState().user;
  const defaultPath = currentUser?.isProvider ? "/provider/dashboard" : "/hmo/dashboard";
  navigate(intended || defaultPath, { replace: true });
      toast.success("Welcome back!");
    } catch (e: unknown) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  };

  
    const email = useFieldControl("email", errors, touchedFields, watch("email"));

  return (
    <AuthLayout title="Login">
      <div className={errMsg ? 'w-full py-4 border-4 border-red-500 bg-black text-white text-center font-[600]' : 'hidden'}>{errMsg}</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail size={18} />}
              placeholder="you@company.com"
              helper={email.errorMessage || "Must be a valid email address"}
              id="email"
              state={email.state}
            {...register("email")}
          />
        </div>
        <div>
          <Input label="Password" leftIcon={<Lock size={18} />} type="password" placeholder="Password" {...register("password")} />
          <FieldErrorText error={errors.password} />
        </div>
        <Button
          className="w-full mt-8"
          disabled={isPending}
          isLoading={isPending}
          loadingText="Logging in…"
          type="submit">
            Log in
          </Button>
      </form>
      <div className="flex items-center justify-center pt-1 text-sm">
        <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
      </div>
    </AuthLayout>
  );
}
