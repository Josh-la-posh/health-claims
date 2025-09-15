import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "../../../app/layouts/AuthLaoyout";

type State = { message?: string; email?: string };

export default function RegisterSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { message, email } = (state as State) || {};

  useEffect(() => {
    const id = setTimeout(() => navigate("/login", { replace: true }), 5000);
    return () => clearTimeout(id);
  }, [navigate]);

  return (
    <AuthLayout
      title="Account created successfully!"
      subtitle={message || "We&apos;ve sent a verification link to your email. Please verify to continue."}
    >
      <div className="flex flex-col items-center justify-center py-10">
        <CheckCircle2 className="h-14 w-14 text-primary mb-3" />
        {email && (
          <p className="text-sm mb-2">
            Please check <span className="font-medium">{email}</span> for the verification link.
          </p>
        )}
        <p className="text-center text-sm">
          You&apos;ll be redirected to the login page in a few seconds…
        </p>
        <Link to="/login" className="mt-4 text-primary hover:underline text-sm">
          Go to Login now
        </Link>
      </div>
    </AuthLayout>
  );
}
