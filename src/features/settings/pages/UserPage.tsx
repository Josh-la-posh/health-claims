// src/features/users/pages/UserManagementPage.tsx
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "../../../components/ui/table/DataTable";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Drawer } from "../../../components/ui/drawer";
import { DropdownSelect } from "../../../components/ui/dropdown-select";
import { RoleEditor } from "../components/RoleEditor";
import type { User, Role } from "../../../types/user";
import {
  fetchUsers,
  inviteUser,
  updateUserRole,
  toggleUserStatus,
  exportUsers
} from "../api";

interface InviteFormState {
  email: string;
  role: Role;
}

const roleOptions = [
  { value: "Admin", label: "Admin" },
  { value: "Support", label: "Support" },
  { value: "Finance", label: "Finance" },
  { value: "Viewer", label: "Viewer" }
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleEditOpen, setRoleEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [savingRole, setSavingRole] = useState(false);

  const [inviteForm, setInviteForm] = useState<InviteFormState>({
    email: "",
    role: "Viewer"
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async () => {
    if (!inviteForm.email) return;
    const newUser = await inviteUser(inviteForm);
    setUsers((u) => [newUser, ...u]);
    setInviteForm({ email: "", role: "Viewer" });
    setInviteOpen(false);
  };

  const handleRoleSave = async (role: Role) => {
    if (!editingUser) return;
    setSavingRole(true);
    await updateUserRole({ id: editingUser.id, role });
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, role } : u))
    );
    setSavingRole(false);
    setRoleEditOpen(false);
    setEditingUser(null);
  };

  const handleToggleStatus = async (user: User) => {
    await toggleUserStatus(user.id);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              status:
                u.status === "Active"
                  ? "Suspended"
                  : u.status === "Suspended"
                  ? "Active"
                  : u.status
            }
          : u
      )
    );
  };

  const handleExport = async () => {
    const blob = await exportUsers();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">User Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setInviteOpen(true)} variant="primary" leftIcon={<Plus className="h-4 w-4" />}>Add New</Button>
          <Button variant="secondary" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <DataTable<User, unknown>
        columns={[
          { accessorKey: "name", header: "Name" },
          { accessorKey: "email", header: "Email" },
          { accessorKey: "role", header: "Role" },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs ${
                  row.original.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : row.original.status === "Suspended"
                    ? "bg-red-500/10 text-red-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {row.original.status}
              </span>
            )
          },
          {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) =>
              new Date(row.original.createdAt).toLocaleDateString()
          },
          {
            id: "actions",
            header: "",
            cell: ({ row }) => (
              <div className="flex gap-2">
                <Button
                  variant="edit"
                  size="sm"
                  onClick={() => {
                    setEditingUser(row.original);
                    setRoleEditOpen(true);
                  }}
                >
                  Edit Role
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleStatus(row.original)}
                >
                  {row.original.status === "Suspended" ? "Activate" : "Suspend"}
                </Button>
              </div>
            )
          }
        ]}
        data={users}
        isLoading={loading}
        emptyMessage="No users found."
        exportOptions={[
            { label: "Export CSV", onClick: handleExport },
        ]}
      />

      {/* Invite Drawer */}
      <Drawer.Root open={inviteOpen} onOpenChange={setInviteOpen}>
        <Drawer.Content
          side="right"
          sideMobile="bottom"
          size="md"
          sizeMobile="lg"
          fullBleed
          className="p-6 space-y-5"
        >
          <h2 className="text-lg font-semibold">Invite User</h2>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
              <div>
                <DropdownSelect
                  label="Role"
                  value={inviteForm.role}
                  onChange={(val) =>
                    setInviteForm((f) => ({ ...f, role: val as Role }))
                  }
                  options={roleOptions}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!inviteForm.email}
                  onClick={handleInvite}
                >
                  Send Invite
                </Button>
                <Button variant="secondary" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
        </Drawer.Content>
      </Drawer.Root>

      {/* Role Editor Drawer */}
      <Drawer.Root open={roleEditOpen} onOpenChange={setRoleEditOpen}>
        <Drawer.Content
          side="right"
          sideMobile="bottom"
          size="sm"
          sizeMobile="md"
          fullBleed
          className="p-6"
        >
          {editingUser && (
            <RoleEditor
              user={editingUser}
              loading={savingRole}
              onCancel={() => {
                setRoleEditOpen(false);
                setEditingUser(null);
              }}
              onSave={handleRoleSave}
            />
          )}
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
