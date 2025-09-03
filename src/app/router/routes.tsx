import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AuthGate from "./AuthGate";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import ForgotPassword from "../../features/auth/pages/ForgotPassword";
import VerifyEmail from "../../features/auth/pages/VerifyEmail";
import RegisterSuccess from "../../features/auth/pages/RegisterSuccess";
import ResetPassword from "../../features/auth/pages/ResetPassword";

const Dashboard = () => <div className="p-6">Welcome to Dashboard</div>; // stub
const Merchants = () => <div className="p-6">Merchants</div>;            // stub
const NotFound = () => <div className="p-6">404</div>;

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthGate>
        <Login />
      </AuthGate>
    ),
  },
  {
    path: "/register",
    element: (
      <AuthGate>
        <Register />
      </AuthGate>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthGate>
        <ForgotPassword />
      </AuthGate>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <AuthGate>
        <ResetPassword />
      </AuthGate>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <AuthGate>
        <VerifyEmail />
      </AuthGate>
    ),
  },
  {
    path: "/register/success",
    element: (
      <AuthGate>
        <RegisterSuccess />
      </AuthGate>
    ),
  },

  // Protected app
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "merchants", element: <Merchants /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
