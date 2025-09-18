import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootRedirect from "./RootRedirect";
import ProtectedRoute, { UnauthOnly } from "./ProtectedRoute";
import LoadingFallback from "./LoadingFallback";
import AppShell from "../layouts/AppShell";
import NotFound from "../../components/system/NotFound";
import MerchantLayout from "../../features/merchants/pages/MerchantLayout";

const Login = React.lazy(() => import("../../features/auth/pages/Login"));
const Register = React.lazy(() => import("../../features/auth/pages/Register"));
const ForgotPassword = React.lazy(() => import("../../features/auth/pages/ForgotPassword"));
const VerifyEmail = React.lazy(() => import("../../features/auth/pages/VerifyEmail"));
const RegisterSuccess = React.lazy(() => import("../../features/auth/pages/RegisterSuccess"));
const ResetPassword = React.lazy(() => import("../../features/auth/pages/ResetPassword"));

const Dashboard = React.lazy(() => Promise.resolve({ default: () => <div className="p-6">Welcome to Dashboard</div> }));

const MerchantProfile = React.lazy(() => Promise.resolve({ default: () => <div>Profile Content</div> }));
const MerchantDocuments = React.lazy(() => Promise.resolve({ default: () => <div>Documents Content</div> }));
const MerchantCredentials = React.lazy(() => Promise.resolve({ default: () => <div>Credentials Content</div> }));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UnauthOnly />,
    children: [
  // default index route: send users to login or dashboard depending on auth state
  { index: true, element: <RootRedirect /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "register/success", element: <RegisterSuccess /> },
    ]
  },

  // Protected app
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { path: "dashboard", element: (
          <Suspense fallback={<LoadingFallback />}>
            <AppShell>
              <Dashboard />
            </AppShell>
          </Suspense>
        ) },
      { path: "merchants", element: (
          <Suspense fallback={<LoadingFallback />}>
            <AppShell>
              <MerchantLayout />
            </AppShell>
          </Suspense>
        ),
        children: [
          { path: "profile", element: <MerchantProfile /> },
          { path: "documents", element: <MerchantDocuments /> },
          { path: "credentials", element: <MerchantCredentials /> }
        ]
      },
      { path: "*", element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        ) },
    ],
  },
  // Global fallback for any unmatched route (handles both auth/unauth users)
  { path: "*", element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ) },
]);

// RootRedirect is located in ./RootRedirect.tsx
