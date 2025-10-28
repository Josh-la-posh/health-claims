import { Home, Users, CreditCard, Settings, FileChartColumn, Wallet, ClipboardList, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// A nav node can be a leaf link or a group with children
export type NavNode = {
  label: string;
  icon?: LucideIcon;
  href?: string; // present if leaf
  permission?: string;
  children?: NavNode[]; // present if group
  defaultOpen?: boolean;
};

export const hmoNav: NavNode[] = [
  { label: "Dashboard", icon: Home, href: "/hmo/dashboard" },
  {
    label: "Enrollees",
    icon: Users,
    defaultOpen: true,
    children: [
      { label: "All Enrollees", href: "/hmo/enrollees" },
      { label: "Enrollee Registration", href: "/hmo/enrollees/register" },
    ],
  },
  {
    label: "Providers",
    icon: Landmark,
    children: [
      { label: "All Providers", href: "/hmo/providers" },
      { label: "Provider Registration", href: "/hmo/providers/register" },
    ],
  },
  {
    label: "Payments",
    icon: Wallet,
    children: [
      { label: "Claims", href: "/hmo/payment/claims" },
      { label: "Authorization", href: "/hmo/payment/authorization" },
      { label: "Tracker", href: "/hmo/payment/tracker" },
    ],
  },
  {
    label: "Reports",
    icon: FileChartColumn,
    children: [
      { label: "Claim History", href: "/hmo/reports/claims" },
      { label: "Payment History", href: "/hmo/reports/payments" },
    ],
  },
  // HMO Management now points directly to the new management page (previous Roles dropdown removed)
  { label: "HMO Management", icon: ClipboardList, href: "/hmo/management/hmos" },
  { label: "Settings", icon: Settings, href: "/hmo/settings" },
];

export const providerNav: NavNode[] = [
  { label: "Dashboard", icon: Home, href: "/provider/dashboard" },
  { label: "Claim Management", icon: ClipboardList, href: "/provider/claims" },
  {
    label: "Enrollees",
    icon: Users,
    children: [
      { label: "Managed Enrollees", href: "/provider/enrollees" },
    ],
  },
  { label: "Tariff", icon: CreditCard, href: "/provider/tariff" },
  { label: "Settings", icon: Settings, href: "/provider/settings" },
];

export function getNav(isProvider: boolean): NavNode[] {
  return isProvider ? providerNav : hmoNav;
}
