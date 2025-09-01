import AuthLayout from "./AuthLayout";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { FieldErrorText } from "../../../components/ui/form";
import { Mail } from "lucide-react";
import { useForgotPassword } from "../hooks";
import { toast } from "sonner";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { mutateAsync, isPending } = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutateAsync(values.email);
      toast.success("If that email exists, a reset link has been sent.");
    } catch {
      toast.error("Failed to send reset link");
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send you a reset link">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Input leftIcon={<Mail size={18} />} placeholder="Email" {...register("email")} />
          <FieldErrorText error={errors.email} />
        </div>
        <Button disabled={isPending} className="w-full">Send reset link</Button>
      </form>
    </AuthLayout>
  );
}
