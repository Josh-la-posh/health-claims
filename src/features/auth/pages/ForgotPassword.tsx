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
import { getUserMessage, type AppError } from "../../../lib/error";
import { useState } from "react";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const { mutateAsync, isPending } = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setErrMsg(null);
    try {
      await mutateAsync(values.email);
      toast.success("If that email exists, a reset link has been sent.");
    } catch (e) {
      const err = e as AppError;
      setErrMsg(getUserMessage(err));
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send you a reset link">
      <div className={errMsg ? 'w-full py-4 border-4 border-red-500 bg-black text-white text-center font-[600]' : 'hidden'}>{errMsg}</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Input leftIcon={<Mail size={18} />} placeholder="Email" {...register("email")} />
          <FieldErrorText error={errors.email} />
        </div>
        <Button disabled={isPending} className="w-full">Send reset link</Button>
      </form>

      {/* Fallback link to login */}
      <div className="mt-6 text-center text-sm">
        <a className="text-primary hover:underline" href="/login">Back to login</a>
      </div>
    </AuthLayout>
  );
}
