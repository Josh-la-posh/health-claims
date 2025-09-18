import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "../../../app/layouts/AuthLaoyout";
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
      navigate(intended || "/dashboard", { replace: true });
      toast.success("Welcome back!");
    } catch (e: unknown) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  };

  
    const email = useFieldControl("email", errors, touchedFields, watch("email"));

  return (
    <AuthLayout title="Sign in to your account" subtitle="Secure access to your fintech dashboard">
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
        <Button className="w-full" disabled={isPending} type="submit">{isPending ? 'Signing in' : 'Sign in'}</Button>
      </form>
      <div className="flex items-center justify-between pt-1 text-sm">
        <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
        <Link to="/register" className="text-primary hover:underline">Create account</Link>
      </div>
    </AuthLayout>
  );
}
