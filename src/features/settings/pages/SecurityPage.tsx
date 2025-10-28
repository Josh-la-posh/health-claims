import { useForm } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useChangePassword } from "../hooks";

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SecurityPage() {
  const {
    register,
    handleSubmit,
    watch,
  formState: { errors },
    reset,
  } = useForm<ChangePasswordForm>();

  const newPassword = watch("newPassword");

  const mut = useChangePassword();
  function onSubmit(values: ChangePasswordForm){
    if(values.newPassword !== values.confirmPassword){ toast.error('Passwords do not match'); return; }
    mut.mutate({ currentPassword: values.currentPassword, newPassword: values.newPassword }, { onSuccess: ()=>{ toast.success('Password updated successfully!'); reset(); }, onError:(e:any)=>{ toast.error(e?.response?.data?.message || 'Failed to update password'); } });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Security</h1>
      <p className="text-muted-foreground text-sm">
        Manage your account security and update your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Current Password"
          type="password"
          leftIcon={<Lock size={16} />}
          state={errors.currentPassword ? "error" : "default"}
          helper={errors.currentPassword?.message as string}
          {...register("currentPassword", { required: "Current password is required" })}
        />

        <Input
          label="New Password"
          type="password"
          leftIcon={<Lock size={16} />}
          state={errors.newPassword ? "error" : "default"}
          helper={errors.newPassword?.message as string}
          {...register("newPassword", {
            required: "New password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />

        <Input
          label="Confirm New Password"
          type="password"
          leftIcon={<Lock size={16} />}
          state={errors.confirmPassword ? "error" : "default"}
          helper={errors.confirmPassword?.message as string}
          {...register("confirmPassword", {
            required: "Confirm your password",
            validate: (val) => val === newPassword || "Passwords do not match",
          })}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>

      {/* Future scaffold for 2FA */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-medium">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add an extra layer of security to your account.
        </p>
        <Button variant="secondary" disabled>
          Enable 2FA (Coming Soon)
        </Button>
      </div>
    </div>
  );
}
