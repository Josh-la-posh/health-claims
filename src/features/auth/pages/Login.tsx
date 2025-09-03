import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthLayout from "./AuthLayout";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FieldErrorText } from "../../../components/ui/form";
import { Mail, Lock } from "lucide-react";
import { useLogin } from "../hooks";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/auth";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { mutateAsync, isPending } = useLogin();
  const navigate = useNavigate();
  const consumeIntended = useAuthStore(s => s.consumeIntendedRoute);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(values);
      const intended = consumeIntended();
      navigate(intended || "/dashboard", { replace: true });
      toast.success("Welcome back!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout title="Sign in to your account" subtitle="Secure access to your fintech dashboard">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Input title="Email" leftIcon={<Mail size={18} />} placeholder="Email" {...register("email")} />
          <FieldErrorText error={errors.email} />
        </div>
        <div>
          <Input title="Password" leftIcon={<Lock size={18} />} type="password" placeholder="Password" {...register("password")} />
          <FieldErrorText error={errors.password} />
        </div>
        <Button className="w-full" disabled={isPending} type="submit">Sign in</Button>
      </form>
      <div className="flex items-center justify-between pt-1 text-sm">
        <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
        <Link to="/register" className="text-primary hover:underline">Create account</Link>
      </div>
    </AuthLayout>
  );
}
