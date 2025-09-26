import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { useRoles, useCreateRole } from '../../../settings/useRoles';
import { Dialog } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { SkeletonLine } from '../../../../components/ui/skeleton';

export default function RoleManagerTab(){
  const { data, isLoading, isError } = useRoles();
  const createMut = useCreateRole();
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState('');

  const roles = data || [];

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold">Created Roles</h2>
        <Button onClick={()=> { setRoleName(''); setOpen(true); }}>Create Role</Button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-border/40 text-muted">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Name</th>
              <th className="text-left px-4 py-2 font-medium">Date created</th>
              <th className="w-1 px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              [...Array(3)].map((_,i)=>(
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2"><SkeletonLine /></td>
                  <td className="px-4 py-2"><SkeletonLine /></td>
                  <td className="px-4 py-2 text-right"><SkeletonLine /></td>
                </tr>
              ))
            )}
            {(!isLoading && isError) && (
              <tr className="border-t border-border"><td colSpan={3} className="px-4 py-6 text-center text-red-600">Failed to load roles.</td></tr>
            )}
            {(!isLoading && !isError && roles.length === 0) && (
              <tr className="border-t border-border">
                <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground text-sm">No roles created yet.</td>
              </tr>
            )}
            {roles.map(r => (
              <tr key={r.id} className="border-t border-border hover:bg-border/20">
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="px-4 py-2">-</td>
                <td className="px-4 py-2 text-right">
                  <Button variant="destructive" disabled>{/* Future delete */}Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CreateRoleDialog open={open} setOpen={setOpen} roleName={roleName} setRoleName={setRoleName} mut={createMut} />
    </div>
  );
}

type CreateRoleDialogProps = {
  open: boolean;
  setOpen: (v:boolean)=> void;
  roleName: string;
  setRoleName: (v:string)=> void;
  mut: ReturnType<typeof useCreateRole>;
};

function CreateRoleDialog({ open, setOpen, roleName, setRoleName, mut }: CreateRoleDialogProps){
  const canSave = roleName.trim().length > 0 && !mut.isPending;
  return (
    <Dialog.Root open={open} onOpenChange={(o)=> { if(!mut.isPending) setOpen(o); }}>
      <Dialog.Content className="max-w-sm lg:max-w-2xl">
        <div className="px-5 pt-5 pb-6 space-y-6">
          <Dialog.Header>
            <Dialog.Title>Create Role</Dialog.Title>
          </Dialog.Header>
          <form
            className="space-y-5"
            onSubmit={(e)=> {
              e.preventDefault();
              if(!canSave) return;
              mut.mutate({ roleName: roleName.trim() }, {
                onSuccess: (res)=> {
                  if(res.isSuccess){
                    setRoleName('');
                    setOpen(false);
                  }
                }
              });
            }}
          >
            <Input label="Role Name" required value={roleName} onChange={e=> setRoleName(e.target.value)} />
            <Button type="submit" className="w-full" disabled={!canSave} isLoading={mut.isPending}>Save</Button>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
