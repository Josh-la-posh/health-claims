import AuthLayout from "./AuthLayout";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FieldErrorText } from "../../../components/ui/form";
import { User, Mail, Lock } from "lucide-react";
import { useRegister } from "../hooks";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { mutateAsync, isPending } = useRegister();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(values);
      toast.success("Account created. Please verify your email.");
      navigate("/verify-email");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Onboard as a merchant and start transacting">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Input leftIcon={<User size={18} />} placeholder="Full name" {...register("name")} />
          <FieldErrorText error={errors.name} />
        </div>
        <div>
          <Input leftIcon={<Mail size={18} />} placeholder="Email" {...register("email")} />
          <FieldErrorText error={errors.email} />
        </div>
        <div>
          <Input leftIcon={<Lock size={18} />} type="password" placeholder="Password" {...register("password")} />
          <FieldErrorText error={errors.password} />
        </div>
        <Button className="w-full" disabled={isPending} type="submit">Create account</Button>
      </form>
      <div className="pt-2 text-sm">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
