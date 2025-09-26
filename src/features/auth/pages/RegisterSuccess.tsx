import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "../../../app/layouts/AuthLayout";

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
      // subtitle={message || "We&apos;ve sent a verification link to your email. Please verify to continue."}
    >
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <CheckCircle2 className="h-14 w-14 text-primary" />
        
        <h2 className="text-xl font-semibold">Your account has been created!</h2>

        <p className="text-gray-600 max-w-md">
          {message || "Please check your email to confirm your account."}
        </p>

        {email && (
          <p className="text-sm">
            Verification mail sent to <span className="font-medium">{email}</span>.
          </p>
        )}
        <p className="text-center text-sm">
          Redirecting you to the login page…
        </p>
        <Link to="/login" className="text-primary hover:underline text-sm">
          Go to Login now
        </Link>
      </div>
    </AuthLayout>
  );
}
