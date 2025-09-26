import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootRedirect from "./RootRedirect";
import ProtectedRoute, { UnauthOnly } from "./ProtectedRoute";
import LoadingFallback from "./LoadingFallback";
import AppShell from "../layouts/AppShell";
import NotFound from "../../components/system/NotFound";
import FriendlyUnauthorized from "../../components/system/FriendlyUnauthorized";
import TenantGuard from "./TenantGuard";

// HMO feature pages (lazy)
const HmoDashboard = React.lazy(() => import("../../features/hmo/pages/DashboardPage"));
const HmoEnrollees = React.lazy(() => import("../../features/hmo/pages/EnrolleesPage"));
const HmoEnrolleeRegistration = React.lazy(() => import("../../features/hmo/pages/EnrolleeRegistrationPage"));
const HmoEnrolleeIndividual = React.lazy(() => import("../../features/hmo/pages/EnrolleeIndividualPage"));
const HmoEnrolleeCorporate = React.lazy(() => import("../../features/hmo/pages/EnrolleeCorporatePage"));
const HmoEnrolleeDetail = React.lazy(() => import("../../features/hmo/pages/EnrolleeDetailPage"));
const HmoEnrolleeIndividualPlanDetail = React.lazy(() => import("../../features/hmo/pages/EnrolleeIndividualPlanDetailPage"));
const HmoProviders = React.lazy(() => import("../../features/hmo/pages/ProvidersPage"));
const HmoProviderRegistration = React.lazy(() => import("../../features/hmo/pages/ProviderRegistrationPage"));
const HmoProviderDetails = React.lazy(() => import("../../features/hmo/pages/ProviderDetailsPage"));
const HmoPayment = React.lazy(() => import("../../features/hmo/pages/PaymentPage"));
const HmoPaymentClaims = React.lazy(() => Promise.resolve({ default: () => <div className="p-6">Payment Claims (placeholder)</div> }));
const HmoPaymentAuthorization = React.lazy(() => Promise.resolve({ default: () => <div className="p-6">Payment Authorization (placeholder)</div> }));
const HmoPaymentTracker = React.lazy(() => Promise.resolve({ default: () => <div className="p-6">Payment Tracker (placeholder)</div> }));
const HmoReports = React.lazy(() => import("../../features/hmo/pages/ReportsPage"));
const HmoReportClaimHistory = React.lazy(() => import("../../features/hmo/pages/report/ClaimHistoryPage.tsx"));
const HmoReportPaymentHistory = React.lazy(() => import("../../features/hmo/pages/report/PaymentHistoryPage.tsx"));
const HmoReportPaymentDetails = React.lazy(() => import("../../features/hmo/pages/report/PaymentDetailsPage.tsx"));
const HmoRoles = React.lazy(() => import("../../features/hmo/pages/RolesPage.tsx"));
const HmoRoleCreate = React.lazy(() => import("../../features/hmo/pages/RoleCreatePage.tsx"));
const HmoManagementHmos = React.lazy(() => import("../../features/hmo/pages/HmoManagementPage"));
const HmoCreatePage = React.lazy(() => import("../../features/hmo/pages/HmoCreatePage"));
const HmoEditPage = React.lazy(() => import("../../features/hmo/pages/HmoEditPage"));
const HmoDetailsPage = React.lazy(() => import("../../features/hmo/pages/HmoDetailsPage"));

// Provider feature pages (lazy)
const ProviderDashboard = React.lazy(() => import("../../features/provider/pages/DashboardPage"));
const ProviderClaims = React.lazy(() => import("../../features/provider/pages/ClaimsPage"));
const ProviderEnrollees = React.lazy(() => import("../../features/provider/pages/EnrolleesPage"));
const ProviderTariff = React.lazy(() => import("../../features/provider/pages/TariffPage"));

// Shared pages
const SettingsPage = React.lazy(() => Promise.resolve({ default: () => <div className="p-6">General Settings (Shared)</div> }));
const HmoSettingsPage = React.lazy(() => import("../../features/hmo/pages/HmoSettingsPage"));
const HmoSettingsGeneral = React.lazy(() => import("../../features/hmo/pages/settings/GeneralSettingsTab"));
const HmoSettingsEnrolleeType = React.lazy(() => import("../../features/hmo/pages/settings/EnrolleeTypeTab"));
const HmoSettingsEnrolleeClass = React.lazy(() => import("../../features/hmo/pages/settings/EnrolleeClassTab"));
const HmoSettingsPlanManagement = React.lazy(() => import("../../features/hmo/pages/settings/PlanManagementTab"));
const HmoSettingsRoleManager = React.lazy(() => import("../../features/hmo/pages/settings/RoleManagerTab"));
const HmoSettingsRolePermission = React.lazy(() => import("../../features/hmo/pages/settings/RolePermissionTab"));
const HmoSettingsRoleAccess = React.lazy(() => import("../../features/hmo/pages/settings/RoleAccessTab"));
const Unauthorized = React.lazy(() => Promise.resolve({ default: FriendlyUnauthorized }));

const Login = React.lazy(() => import("../../features/auth/pages/Login"));
const Register = React.lazy(() => import("../../features/auth/pages/Register"));
const ForgotPassword = React.lazy(() => import("../../features/auth/pages/ForgotPassword"));
const VerifyEmail = React.lazy(() => import("../../features/auth/pages/VerifyEmail"));
const RegisterSuccess = React.lazy(() => import("../../features/auth/pages/RegisterSuccess"));
const ResetPassword = React.lazy(() => import("../../features/auth/pages/ResetPassword"));

// Removed legacy generic dashboard / merchants / transactions / deep settings pages

export const router = createBrowserRouter([
  {
    path: "/",
    element: <UnauthOnly />,
    children: [
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
      // tenant routes only below
      { path: "unauthorized", element: <Suspense fallback={<LoadingFallback />}><Unauthorized /></Suspense> },
      // HMO tenant routes
      { path: "hmo", element: <TenantGuard tenant="hmo" />, children: [
        { path: "dashboard", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoDashboard /></AppShell></Suspense> },
        { path: "enrollees", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEnrollees /></AppShell></Suspense> },
        { path: "enrollees/register", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEnrolleeRegistration /></AppShell></Suspense> },
        { path: "enrollees/register/individual", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEnrolleeIndividual /></AppShell></Suspense> },
  { path: "enrollees/register/individual/plan-details", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEnrolleeIndividualPlanDetail /></AppShell></Suspense> },
        { path: "enrollees/register/corporate", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEnrolleeCorporate /></AppShell></Suspense> },
  { path: "enrollees/:id", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEnrolleeDetail /></AppShell></Suspense> },
  { path: "enrollees/:id/plan", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEnrolleeDetail /></AppShell></Suspense> },
  { path: "enrollees/:id/dependents", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEnrolleeDetail /></AppShell></Suspense> },
        { path: "providers", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoProviders /></AppShell></Suspense> },
  { path: "providers/register", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoProviderRegistration /></AppShell></Suspense> },
    { path: "providers/:id", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoProviderDetails /></AppShell></Suspense> },
  { path: "payment", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoPayment /></AppShell></Suspense> },
  { path: "payment/claims", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoPaymentClaims /></AppShell></Suspense> },
  { path: "payment/authorization", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoPaymentAuthorization /></AppShell></Suspense> },
  { path: "payment/tracker", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoPaymentTracker /></AppShell></Suspense> },
        { path: "reports", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoReports /></AppShell></Suspense> },
  { path: "reports/claims", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoReportClaimHistory /></AppShell></Suspense> },
  { path: "reports/payments", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoReportPaymentHistory /></AppShell></Suspense> },
  { path: "reports/payments/:id", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoReportPaymentDetails /></AppShell></Suspense> },
        { path: "management/roles", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoRoles /></AppShell></Suspense> },
        { path: "management/roles/new", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoRoleCreate /></AppShell></Suspense> },
        { path: "management/hmos", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoManagementHmos /></AppShell></Suspense> },
        { path: "management/hmos/new", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoCreatePage /></AppShell></Suspense> },
        { path: "management/hmos/:id/edit", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoEditPage /></AppShell></Suspense> },
  { path: "management/hmos/:id", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoDetailsPage /></AppShell></Suspense> },
        { path: "settings", element: <Suspense fallback={<LoadingFallback />}><AppShell><HmoSettingsPage /></AppShell></Suspense>, children: [
          { index: true, element: <Suspense fallback={<LoadingFallback />}><HmoSettingsGeneral /></Suspense> },
          { path: "general", element: <Suspense fallback={<LoadingFallback />}><HmoSettingsGeneral /></Suspense> },
          { path: "enrollee-type", element: <Suspense fallback={<LoadingFallback />}><HmoSettingsEnrolleeType /></Suspense> },
          { path: "enrollee-class", element: <Suspense fallback={<LoadingFallback />}><HmoSettingsEnrolleeClass /></Suspense> },
          { path: "plan-management", element: <Suspense fallback={<LoadingFallback />}><HmoSettingsPlanManagement /></Suspense> },
          { path: "role-manager", element: <Suspense fallback={<LoadingFallback />}><HmoSettingsRoleManager /></Suspense> },
          { path: "role-permission", element: <Suspense fallback={<LoadingFallback />}><HmoSettingsRolePermission /></Suspense> },
          { path: "role-access", element: <Suspense fallback={<LoadingFallback />}><HmoSettingsRoleAccess /></Suspense> },
        ] },
      ]},
      // Provider tenant routes
      { path: "provider", element: <TenantGuard tenant="provider" />, children: [
        { path: "dashboard", element: <Suspense fallback={<LoadingFallback />}><AppShell><ProviderDashboard /></AppShell></Suspense> },
        { path: "claims", element: <Suspense fallback={<LoadingFallback />}><AppShell><ProviderClaims /></AppShell></Suspense> },
        { path: "enrollees", element: <Suspense fallback={<LoadingFallback />}><AppShell><ProviderEnrollees /></AppShell></Suspense> },
        { path: "tariff", element: <Suspense fallback={<LoadingFallback />}><AppShell><ProviderTariff /></AppShell></Suspense> },
      ]},
  { path: "settings", element: <Suspense fallback={<LoadingFallback />}><AppShell><SettingsPage /></AppShell></Suspense> },
      { path: "*", element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        ) },
    ],
  },
  // Global fallback for any unmatched route (handles both auth/unauth users)
  { path: "*", element: <NotFound /> },
]);

// RootRedirect is located in ./RootRedirect.tsx
