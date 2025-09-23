export type Role = "Admin" | "Support" | "Finance" | "Viewer";

export type UserStatus = "Active" | "Suspended" | "Pending";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string; // ISO
}

export interface InviteUserPayload {
  email: string;
  role: Role;
}

export interface UpdateUserRolePayload {
  id: string;
  role: Role;
}

export interface ToggleUserStatusPayload {
  id: string;
}

export interface PaginatedUsers {
  data: User[];
  pageNumber: number;
  pageSize: number;
  total?: number;
}