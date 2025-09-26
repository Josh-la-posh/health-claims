import { useState, useEffect, useMemo } from 'react';
import { useUsers, useCreateUser, useUpdateUser } from '../../../settings/useUserAccess';
import { useRoles } from '../../../settings/useRoles';
import { Button } from '../../../../components/ui/button';
import { Dialog } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { PenLine, Plus } from 'lucide-react';
import type { RoleItem } from '../../../settings/rolesApi';
import { useAuthStore } from '../../../../store/auth';
import { DataTable } from '../../../../components/ui/table/DataTable';
import type { ColumnDef, Row } from '@tanstack/react-table';
import type { AccessUser } from '../../../settings/userAccessApi';

// Resolve HMO ID from authenticated user or (fallback) decode from access token claim `HMOId`.
function useResolvedHmoId(){
  const rawUserHmoId = useAuthStore(s => s.user?.hmoId || null);
  const accessToken = useAuthStore(s => s.accessToken);
  let decoded: string | null = rawUserHmoId;
  if(!decoded && accessToken){
    try {
      const [, payload] = accessToken.split('.');
      const json = JSON.parse(atob(payload));
      if(typeof json.HMOId === 'string' && json.HMOId.trim()) decoded = json.HMOId;
    } catch { /* ignore */ }
  }
  return decoded;
}

export default function RoleAccessTab(){
  const hmoId = useResolvedHmoId();
  const { data: users, isLoading, isError, refetch } = useUsers(hmoId || undefined);
  const { data: roles } = useRoles();
  const createMut = useCreateUser(hmoId || undefined);
  const updateMut = useUpdateUser(hmoId || undefined);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', role: '' });

  const isEditing = editingId !== null;
  const baseRequired = form.firstName.trim().length>0 && form.lastName.trim().length>0 && form.email.trim().length>0 && form.phoneNumber.trim().length>0;
  const canSave = isEditing ? baseRequired : baseRequired && form.password.length >= 6 && form.password === form.confirmPassword && !!form.role;
  const isPending = createMut.isPending || updateMut.isPending;

  function reset(){
    setForm({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', role: '' });
    setEditingId(null);
  }

  function handleSubmit(){
    if(!canSave) return;
    if(isEditing && editingId){
      updateMut.mutate({ id: editingId, firstName: form.firstName.trim(), lastName: form.lastName.trim(), phoneNumber: form.phoneNumber.trim(), email: form.email.trim() }, {
        onSuccess: (res)=> { if(res.isSuccess){ reset(); setOpen(false); } }
      });
    } else {
      createMut.mutate({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phoneNumber: form.phoneNumber.trim(), password: form.password, confirmPassword: form.confirmPassword, role: form.role }, {
        onSuccess: (res)=> { if(res.isSuccess){ reset(); setOpen(false); } }
      });
    }
  }

  // Refetch when hmoId becomes available (in case hook was disabled initially)
  useEffect(()=>{ if(hmoId){ refetch(); } }, [hmoId, refetch]);

  const columns = useMemo<ColumnDef<AccessUser, unknown>[]>(() => [
    {
      header: 'Name',
      accessorFn: (row: AccessUser) => `${row.firstName} ${row.lastName}`,
      id: 'name',
      cell: (info) => <span className="font-medium">{String(info.getValue())}</span>
    },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Role Assigned',
      id: 'role',
  cell: ({ row }: { row: Row<AccessUser> }) => row.original.roles?.[0] || '—'
    },
    {
      header: 'Last Login',
      id: 'lastLogin',
      cell: () => '—' // TODO: replace with real data when backend supports
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: Row<AccessUser> }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="edit" leftIcon={<PenLine className="h-3.5 w-3.5" />} onClick={()=> { const u = row.original; setEditingId(u.id); setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, phoneNumber: u.phoneNumber, password: '', confirmPassword: '', role: u.roles?.[0] || '' }); setOpen(true); }}>Edit</Button>
          <Button variant="destructive" disabled>Remove</Button>
        </div>
      )
    }
  ], [setForm]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Teammates</h2>
  <Button onClick={()=> { reset(); setOpen(true); }} disabled={!hmoId} variant="primary" leftIcon={<Plus className="h-4 w-4" />}>Add New</Button>
      </div>
      {!hmoId ? (
        <div className="border border-border rounded-xl bg-card p-10 text-center text-sm text-muted-foreground">No HMO context available.</div>
      ) : (
        <DataTable
          data={users || []}
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="No users yet."
        />
      )}
      <UserDialog open={open} setOpen={setOpen} form={form} setForm={setForm} canSave={!!canSave} isEditing={isEditing} isPending={isPending} onSubmit={handleSubmit} reset={reset} roles={(roles as RoleItem[]) || []} />
    </div>
  );
}

interface UserFormState { firstName: string; lastName: string; email: string; phoneNumber: string; password: string; confirmPassword: string; role: string; }

type DialogProps = {
  open: boolean;
  setOpen: (v:boolean)=> void;
  form: UserFormState;
  setForm: React.Dispatch<React.SetStateAction<UserFormState>>;
  canSave: boolean;
  isEditing: boolean;
  isPending: boolean;
  onSubmit: () => void;
  reset: ()=> void;
  roles: RoleItem[];
};

function UserDialog({ open, setOpen, form, setForm, canSave, isEditing, isPending, onSubmit, reset, roles }: DialogProps){
  return (
    <Dialog.Root open={open} onOpenChange={(o)=> { if(!isPending) { if(!o) reset(); setOpen(o); } }}>
      <Dialog.Content className="max-w-md lg:max-w-2xl">
        <div className="px-5 pt-5 pb-6 space-y-6">
          <Dialog.Header>
            <Dialog.Title>{isEditing ? 'Edit User' : 'Add New User'}</Dialog.Title>
          </Dialog.Header>
          <form
            className="grid grid-cols-2 gap-4"
            onSubmit={(e)=> { e.preventDefault(); if(canSave) onSubmit(); }}
          >
            <Input label="First Name" required value={form.firstName} onChange={e=> setForm(f=> ({ ...f, firstName: e.target.value }))} />
            <Input label="Last Name" required value={form.lastName} onChange={e=> setForm(f=> ({ ...f, lastName: e.target.value }))} />
            <Input label="Email" type="email" required className="col-span-2" value={form.email} onChange={e=> setForm(f=> ({ ...f, email: e.target.value }))} />
            <Input label="Phone Number" required value={form.phoneNumber} onChange={e=> setForm(f=> ({ ...f, phoneNumber: e.target.value }))} />
            <Select
              label="Role"
              placeholder="Select role"
              options={(roles || []).map(r => ({ value: r.name, label: r.name }))}
              value={form.role}
              onChange={(val)=> setForm(f => ({ ...f, role: String(val) }))}
              disabled={isEditing}
              required={!isEditing}
              searchable={(roles || []).length > 6}
              helper={!isEditing && !form.role ? 'Required' : undefined}
              state={!isEditing && !form.role ? 'error' : 'default'}
            />
            {!isEditing && <Input label="Password" type="password" required value={form.password} onChange={e=> setForm(f=> ({ ...f, password: e.target.value }))} />}
            {!isEditing && <Input label="Confirm Password" type="password" required value={form.confirmPassword} onChange={e=> setForm(f=> ({ ...f, confirmPassword: e.target.value }))} helper={form.confirmPassword && form.password !== form.confirmPassword ? 'Passwords do not match' : undefined} state={form.confirmPassword && form.password !== form.confirmPassword ? 'error' : undefined} />}
            <div className="col-span-2 mt-2">
              <Button type="submit" className="w-full" disabled={!canSave} isLoading={isPending}>{isEditing ? 'Update User' : 'Create User'}</Button>
            </div>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
