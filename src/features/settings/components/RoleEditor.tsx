// src/features/users/components/RoleEditor.tsx
import { useState } from "react";
import type { User, Role } from "../../../types/user";
import { Button } from "../../../components/ui/button";
import { DropdownSelect } from "../../../components/ui/dropdown-select";

interface RoleEditorProps {
  user: User;
  onSave: (role: Role) => Promise<void> | void;
  onCancel: () => void;
  loading?: boolean;
}

const roleOptions = [
  { value: "Admin", label: "Admin" },
  { value: "Support", label: "Support" },
  { value: "Finance", label: "Finance" },
  { value: "Viewer", label: "Viewer" },
];

export function RoleEditor({
  user,
  onSave,
  onCancel,
  loading,
}: RoleEditorProps) {
  const [role, setRole] = useState<Role>(user.role);

  const handleSave = async () => {
    await onSave(role);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Edit Role</h3>
      <div className="space-y-2">
        <p className="text-sm text-muted">
          {user.name} ({user.email})
        </p>
        <DropdownSelect
          label="Role"
          value={role}
          onChange={(val) => setRole(val as Role)}
          options={roleOptions}
          className="min-w-[200px]"
        />
      </div>
      <div className="flex gap-2">
        <Button disabled={loading} onClick={handleSave}>
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
