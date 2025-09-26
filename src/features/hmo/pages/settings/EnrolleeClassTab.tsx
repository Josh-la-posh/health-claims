import { useEnrolleeClasses, useActivateEnrolleeClass, useDeactivateEnrolleeClass, useCreateEnrolleeClass, useUpdateEnrolleeClass } from '../../../settings/useEnrolleeClasses';
import { Button } from '../../../../components/ui/button';
import { formatDate } from '../../../../utils/date';
import { Dialog } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { useState } from 'react';
import { EmptyState } from '../../../../components/ui/empty-state';
import { Layers, PenLine, Plus } from 'lucide-react';
import { DataTable } from '../../../../components/ui/table/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { ActionResultDialog } from '../../../../components/ui/action-result-dialog';

export default function EnrolleeClassTab(){
  const { data, isLoading, isError } = useEnrolleeClasses();
  const activate = useActivateEnrolleeClass();
  const deactivate = useDeactivateEnrolleeClass();
  const createMut = useCreateEnrolleeClass();
  const updateMut = useUpdateEnrolleeClass();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const isEditing = !!editingId;
  const activeMut = isEditing ? updateMut : createMut;
  const canSave = form.name.trim().length > 0 && form.description.trim().length > 0 && !activeMut.isPending;
  const [result, setResult] = useState<{ open: boolean; type: 'success' | 'error'; title: string; message: string }>({ open: false, type: 'success', title: '', message: '' });

  function openSuccess(title: string, message: string){
    setResult({ open: true, type: 'success', title, message });
  }

  if(isLoading) return <div className="text-sm text-muted-foreground">Loading enrollee classes...</div>;
  if(isError) return <div className="text-sm text-red-600">Failed to load enrollee classes.</div>;
  const list = data || [];

  const columns: ColumnDef<(typeof list)[number]>[] = [
    { accessorKey: 'name', header: 'Class Name', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { id: 'status', header: 'Status', cell: ({ row }) => <span className={row.original.isActive ? 'text-xs font-medium text-emerald-600' : 'text-xs font-medium text-muted-foreground'}>{row.original.isActive ? 'Active' : 'Inactive'}</span> },
    { id: 'created', header: 'Created Date', cell: ({ row }) => formatDate(row.original.createdDate, 'dd/MM/yyyy') },
    { id: 'actions', header: '', cell: ({ row }) => {
        const ec = row.original; const busy = activate.isPending || deactivate.isPending;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="edit" onClick={()=> { setEditingId(ec.id); setForm({ name: ec.name, description: ec.description || '' }); setOpen(true); }} leftIcon={<PenLine className="h-3.5 w-3.5" />}>Edit</Button>
            {ec.isActive ? (
              <Button variant="destructive" disabled={busy} onClick={()=> deactivate.mutate(ec.id, { onSuccess: (res)=> { if(res.isSuccess) openSuccess('Enrollee Class Deactivated', `${ec.name} has been deactivated.`); } })}>{deactivate.isPending ? '...' : 'Deactivate'}</Button>
            ) : (
              <Button variant="primary" disabled={busy} onClick={()=> activate.mutate(ec.id, { onSuccess: (res)=> { if(res.isSuccess) openSuccess('Enrollee Class Activated', `${ec.name} is now active.`); } })}>{activate.isPending ? '...' : 'Activate'}</Button>
            )}
          </div>
        );
      }
    }
  ];

  if(!list.length){
    return (
      <div className="border border-border rounded-xl bg-card">
        <EmptyState
          icon={<Layers className="h-8 w-8" />}
          title="Create and manage enrollee class"
          description="This is essential for classifying enrollees."
          actionLabel="Add New Enrollee Class"
          onAction={()=> { setEditingId(null); setForm({ name: '', description: '' }); setOpen(true); }}
          className="px-8"
        />
        <ClassDialog {...{open,setOpen,form,setForm,canSave,mut:activeMut,isEditing,editingId,reset: ()=> { setForm({ name:'', description:'' }); setEditingId(null); }, onSuccess: (t,m)=> openSuccess(t,m) }} />
        <ActionResultDialog open={result.open} type={result.type} title={result.title} message={result.message} onOpenChange={(o)=> setResult(r=> ({ ...r, open: o }))} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Existing enrollee classes</h2>
  <Button onClick={()=> { setEditingId(null); setForm({ name: '', description: '' }); setOpen(true); }} variant="primary" leftIcon={<Plus className="h-4 w-4" />}>Add New</Button>
      </div>
      <ClassDialog {...{open,setOpen,form,setForm,canSave,mut:activeMut,isEditing,editingId,reset: ()=> { setForm({ name:'', description:'' }); setEditingId(null); }, onSuccess: (t,m)=> openSuccess(t,m) }} />
      <DataTable columns={columns} data={list} />
      <ActionResultDialog open={result.open} type={result.type} title={result.title} message={result.message} onOpenChange={(o)=> setResult(r=> ({ ...r, open: o }))} />
    </div>
  );
}

type ClassDialogProps = {
  open: boolean;
  setOpen: (v:boolean)=> void;
  form: { name: string; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
  canSave: boolean;
  mut: ReturnType<typeof useCreateEnrolleeClass> | ReturnType<typeof useUpdateEnrolleeClass>;
  isEditing: boolean;
  editingId: string | null;
  reset: ()=> void;
  onSuccess: (title: string, message: string) => void;
};

function ClassDialog({ open, setOpen, form, setForm, canSave, mut, isEditing, editingId, reset, onSuccess }: ClassDialogProps){
  return (
    <Dialog.Root open={open} onOpenChange={(o)=> { if(!mut.isPending) { if(!o) reset(); setOpen(o); } }}>
      <Dialog.Content className="max-w-sm lg:max-w-2xl">
        <div className="px-5 pt-5 pb-6 space-y-6">
          <Dialog.Header>
            <Dialog.Title>{isEditing ? 'Edit Enrollee Class' : 'Create Enrollee Class'}</Dialog.Title>
          </Dialog.Header>
          <form
            className="space-y-5"
            onSubmit={(e)=> {
              e.preventDefault();
              if(!canSave) return;
              const payload = { name: form.name.trim(), description: form.description.trim() } as { name: string; description: string; id?: string };
              if(isEditing && editingId){
                (mut as ReturnType<typeof useUpdateEnrolleeClass>).mutate({ id: editingId, ...payload }, {
                  onSuccess: (res: unknown)=> {
                    const r = res as { isSuccess?: boolean };
                    if(r?.isSuccess){
                      onSuccess('Enrollee Class Updated', `${form.name} has been updated successfully.`);
                      reset();
                      setOpen(false);
                    }
                  }
                });
              } else {
                (mut as ReturnType<typeof useCreateEnrolleeClass>).mutate(payload, {
                  onSuccess: (res: unknown)=> {
                    const r = res as { isSuccess?: boolean };
                    if(r?.isSuccess){
                      onSuccess('Enrollee Class Created', `${form.name} has been created successfully.`);
                      reset();
                      setOpen(false);
                    }
                  }
                });
              }
            }}
          >
        <Input label="Enrollee Class Name" required value={form.name} onChange={e=> setForm(f=> ({ ...f, name: e.target.value }))} />
        <Input label="Description" required value={form.description} onChange={e=> setForm(f=> ({ ...f, description: e.target.value }))} helper={!form.description.trim() ? 'Description is required' : undefined} state={!form.description.trim() ? 'error' : undefined} />
        <Button type="submit" className="w-full" isLoading={mut.isPending} disabled={!canSave}>{isEditing ? 'Update' : 'Save'}</Button>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
