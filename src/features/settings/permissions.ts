// src/features/users/permissions.ts
export type Permission =
  | "merchants.view"
  | "merchants.manage"
  | "transactions.view"
  | "transactions.manage"
  | "disputes.view"
  | "disputes.manage"
  | "users.view"
  | "users.manage"
  | "reports.view";

export const PERMISSION_GROUPS: Record<string, Permission[]> = {
  Merchants: ["merchants.view", "merchants.manage"],
  Transactions: ["transactions.view", "transactions.manage"],
  Disputes: ["disputes.view", "disputes.manage"],
  Users: ["users.view", "users.manage"],
  Reports: ["reports.view"],
};

export const ALL_PERMISSIONS: Record<string, Permission[]> = {
  Admin: Object.values(PERMISSION_GROUPS).flat(),
  Support: [
    "merchants.view",
    "transactions.view",
    "disputes.view",
    "disputes.manage",
  ],
  Finance: [
    "transactions.view",
    "transactions.manage",
    "reports.view",
  ],
  Viewer: ["reports.view"],
};
