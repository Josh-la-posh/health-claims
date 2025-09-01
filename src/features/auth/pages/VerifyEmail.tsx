import AuthLayout from "./AuthLayout";
import { useVerifyEmail } from "../hooks";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [token, setToken] = useState("");
  const { mutateAsync, isPending } = useVerifyEmail();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync(token);
      toast.success("Email verified. You can now sign in.");
    } catch {
      toast.error("Invalid or expired token");
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="Paste the verification code sent to your email">
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Verification token" value={token} onChange={e => setToken(e.target.value)} />
        <Button className="w-full" disabled={isPending}>Verify</Button>
      </form>
    </AuthLayout>
  );
}
