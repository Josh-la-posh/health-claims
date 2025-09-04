import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AuthGate from "./AuthGate";
import LoadingFallback from "./LoadingFallback";

const Login = React.lazy(() => import("../../features/auth/pages/Login"));
const Register = React.lazy(() => import("../../features/auth/pages/Register"));
const ForgotPassword = React.lazy(() => import("../../features/auth/pages/ForgotPassword"));
const VerifyEmail = React.lazy(() => import("../../features/auth/pages/VerifyEmail"));
const RegisterSuccess = React.lazy(() => import("../../features/auth/pages/RegisterSuccess"));
const ResetPassword = React.lazy(() => import("../../features/auth/pages/ResetPassword"));

const Dashboard = React.lazy(() => Promise.resolve({ default: () => <div className="p-6">Welcome to Dashboard</div> }));
const Merchants = React.lazy(() => Promise.resolve({ default: () => <div className="p-6">Merchants</div> }));
const NotFound = React.lazy(() => Promise.resolve({ default: () => <div className="p-6">404</div> }));

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthGate>
        <Suspense fallback={<LoadingFallback />}>
          <Login />
        </Suspense>
      </AuthGate>
    ),
  },
  {
    path: "/register",
    element: (
      <AuthGate>
        <Suspense fallback={<LoadingFallback />}>
          <Register />
        </Suspense>
      </AuthGate>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthGate>
        <Suspense fallback={<LoadingFallback />}>
          <ForgotPassword />
        </Suspense>
      </AuthGate>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <AuthGate>
        <Suspense fallback={<LoadingFallback />}>
          <ResetPassword />
        </Suspense>
      </AuthGate>
    ),
  },
  {
    path: "/verify-email",
    element: (
      <AuthGate>
        <Suspense fallback={<LoadingFallback />}>
          <VerifyEmail />
        </Suspense>
      </AuthGate>
    ),
  },
  {
    path: "/register/success",
    element: (
      <AuthGate>
        <Suspense fallback={<LoadingFallback />}>
          <RegisterSuccess />
        </Suspense>
      </AuthGate>
    ),
  },

  // Protected app
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "dashboard", element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ) },
      { path: "merchants", element: (
          <Suspense fallback={<LoadingFallback />}>
            <Merchants />
          </Suspense>
        ) },
      { path: "*", element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        ) },
    ],
  },
]);
