// src/features/users/api.ts
import type {
  User,
  InviteUserPayload,
  PaginatedUsers,
  UpdateUserRolePayload,
} from "../../types/user";

// Mock fallback (remove when backend ready)
const mockDelay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export async function fetchUsers(pageNumber = 1, pageSize = 20): Promise<PaginatedUsers> {
  // Example real call:
  // const res = await api.get<PaginatedUsers>("/users", { params: { pageNumber, pageSize } });
  // return res.data;
  await mockDelay();
  return {
    data: [
      {
        id: "u1",
        name: "Jane Doe",
        email: "jane@example.com",
        role: "Admin",
        status: "Active",
        createdAt: "2025-09-20T10:00:00.000Z"
      }
    ],
    pageNumber,
    pageSize,
    total: 1
  };
}

export async function inviteUser(payload: InviteUserPayload): Promise<User> {
  // const res = await api.post<User>("/users/invite", payload);
  // return res.data;
  await mockDelay();
  return {
    id: crypto.randomUUID(),
    name: payload.email.split("@")[0],
    email: payload.email,
    role: payload.role,
    status: "Pending",
    createdAt: new Date().toISOString()
  };
}

export async function updateUserRole({ id, role }: UpdateUserRolePayload): Promise<void> {
  // await api.patch(`/users/${id}/role`, { role });
  await mockDelay();
  console.log(`Updated user ${id} role -> ${role}`);
}

export async function toggleUserStatus(id: string): Promise<void> {
  // await api.post(`/users/${id}/toggle-status`);
  await mockDelay();
  console.log(`Toggled status for ${id}`);
}

export async function exportUsers(): Promise<Blob> {
  // const res = await api.get("/users/export", { responseType: "blob" });
  // return res.data;
  await mockDelay();
  const csv = "id,name,email,role,status,createdAt\n" +
    "u1,Jane Doe,jane@example.com,Admin,Active,2025-09-20T10:00:00.000Z";
  return new Blob([csv], { type: "text/csv" });
}
