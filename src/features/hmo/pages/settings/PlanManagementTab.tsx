import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { ActionResultDialog } from '../../../../components/ui/action-result-dialog';
import { Dialog } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Layers, PenLine, Plus } from 'lucide-react';
import { EmptyState } from '../../../../components/ui/empty-state';
import { usePlanDetails, useCreatePlanDetail, useActivatePlanDetail, useDeactivatePlanDetail, useUpdatePlanDetail, type PlanDetailRecord } from '../../../settings/planDetailsApi';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '../../../../components/ui/table/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { api } from '../../../../lib/axios';
import { useMemberTypes } from '../../../enrollees/hooks';

const planDetailSchema = z.object({
  planTypeId: z.string().min(1,'Required'),
  memberTypeId: z.string().min(1,'Required'),
  amount: z.coerce.number().min(0,'Must be ≥ 0'),
  discount: z.coerce.number().min(0,'Must be ≥ 0'),
  referralNumber: z.string().optional().or(z.literal('')),
  benefits: z.string().optional().or(z.literal('')),
  billingFrequency: z.enum(['Monthly','Quarterly','Yearly']),
});
type PlanDetailForm = z.infer<typeof planDetailSchema>;

export default function PlanManagementTab(){
  const { data: details, isLoading, isError } = usePlanDetails();
  const createMut = useCreatePlanDetail();
  const updateMut = useUpdatePlanDetail();
  const activate = useActivatePlanDetail();
  const deactivate = useDeactivatePlanDetail();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState<{ open:boolean; type:'success'|'error'; title:string; message:string }>({ open:false, type:'success', title:'', message:'' });
  const [editing, setEditing] = useState<null | string>(null);

  const form = useForm<PlanDetailForm>({ resolver: zodResolver(planDetailSchema), defaultValues: { planTypeId:'', memberTypeId:'', amount:0, discount:0, referralNumber:'', benefits:'', billingFrequency:'Monthly' } });

  // Lookups (reuse existing endpoints from enrollee flow)
  // Member types via existing shared hook returning NamedListResponse shape
  const memberTypesQuery = useMemberTypes();
  const memberTypes = { data: memberTypesQuery.data?.data?.map(m=> ({ id: m.id, name: m.name })) || [], isLoading: memberTypesQuery.isLoading };

  // Lightweight plan types list (fetch all - backend paging not yet applied here)
  const planTypes = useQuery({ queryKey:['plan-types-all'], queryFn: async ()=> (await api.get('/settings/plan-types')).data.data as { id:string; name:string }[] });

  function resetAndClose(){ form.reset(); setEditing(null); setDialogOpen(false); }
  function openCreate(){ setEditing(null); form.reset(); setDialogOpen(true); }
  function openEdit(row: PlanDetailRecord){
    setEditing(row.id);
    form.reset({
      planTypeId: row.planTypeId,
      memberTypeId: row.memberTypeId,
      amount: row.amount,
      discount: row.discount,
      referralNumber: row.referralNumber || '',
      benefits: row.benefits || '',
      billingFrequency: row.billingFrequency as PlanDetailForm['billingFrequency'],
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: PlanDetailForm){
    try {
      if(editing){
        const res = await updateMut.mutateAsync({ id: editing, ...values, amount: Number(values.amount), discount: Number(values.discount) });
        if(res.isSuccess){
          setResult({ open:true, type:'success', title:'Plan Detail Updated', message:'Plan detail has been updated.' });
          resetAndClose();
        }
      } else {
        const res = await createMut.mutateAsync({ ...values, amount: Number(values.amount), discount: Number(values.discount) });
        if(res.isSuccess){
            setResult({ open:true, type:'success', title:'Plan Detail Created', message:'Plan detail has been created.' });
            resetAndClose();
        }
      }
    } catch(e){
      setResult({ open:true, type:'error', title: editing ? 'Update Failed':'Creation Failed', message: e instanceof Error ? e.message : 'Request failed' });
    }
  }

  interface PlanDetailRow { id:string; isActive:boolean; amount:number; discount:number; billingFrequency:PlanDetailForm['billingFrequency']|string; planType?: { name:string }; memberType?: { name:string } }
  function toggle(it: PlanDetailRow){
    const mut = it.isActive ? deactivate : activate;
    mut.mutate(it.id, { onSuccess: (res)=> {
      if(res.isSuccess){
        setResult({ open:true, type:'success', title: it.isActive ? 'Plan Detail Deactivated':'Plan Detail Activated', message: `Plan detail has been ${it.isActive? 'deactivated':'activated'}.` });
      }
    }, onError: (err)=> setResult({ open:true, type:'error', title:'Action Failed', message: err instanceof Error ? err.message : 'Request failed' }) });
  }

  if(isLoading) return <div className="text-sm text-muted-foreground">Loading plan details...</div>;
  if(isError) return <div className="text-sm text-red-600">Failed to load plan details.</div>;

  const list = details || [];

  if(!list.length){
    return (
      <div className="border border-border rounded-xl bg-card">
        <EmptyState
          icon={<Layers className="h-8 w-8" />}
          title="Create and manage plan details"
          description="Define pricing, benefits and billing frequency."
          actionLabel={<span className="inline-flex items-center gap-1"><Plus className="h-4 w-4" /> Add Plan Detail</span> as unknown as string}
          onAction={openCreate}
          className="px-8"
        />
  <PlanDetailDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} onSubmit={onSubmit} loading={createMut.isPending} memberTypes={memberTypes.data||[]} planTypes={planTypes.data||[]} />
        <ActionResultDialog open={result.open} type={result.type} title={result.title} message={result.message} onOpenChange={(o)=> setResult(r=> ({ ...r, open: o }))} />
      </div>
    );
  }

  const columns: ColumnDef<PlanDetailRecord>[] = [
    { accessorKey: 'planType.name', header: 'Plan Type', cell: ({ row }) => row.original.planType?.name || '—' },
    { accessorKey: 'memberType.name', header: 'Member Type', cell: ({ row }) => row.original.memberType?.name || '—' },
    { id: 'amount', header: 'Amount', cell: ({ row }) => `₦${Intl.NumberFormat().format(row.original.amount)}` },
    { id: 'discount', header: 'Discount', cell: ({ row }) => `${row.original.discount}%` },
    { accessorKey: 'billingFrequency', header: 'Billing' },
    { id: 'status', header: 'Status', cell: ({ row }) => row.original.isActive ? <span className="text-emerald-600 font-medium">Active</span> : <span className="text-muted-foreground">Inactive</span> },
    { id: 'actions', header: '', cell: ({ row }) => {
        const it = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="edit" size="sm" className="flex items-center gap-1" onClick={()=> openEdit(it)}>
              <PenLine className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant={it.isActive ? 'destructive':'primary'} size="sm" isLoading={(activate.isPending||deactivate.isPending) && (activate.variables===it.id || deactivate.variables===it.id)} onClick={()=> toggle(it)}>
              {it.isActive ? 'Deactivate':'Activate'}
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Plan Details</h2>
        <Button onClick={openCreate} variant="primary" leftIcon={<Plus className="h-4 w-4" />}>Add New</Button>
      </div>
      <DataTable<PlanDetailRecord, unknown>
        columns={columns}
        data={list}
        pageIndex={0}
        pageSize={list.length}
        onNextPage={()=> {}}
        onPrevPage={()=> {}}
        canNextPage={false}
        canPrevPage={false}
      />
      <PlanDetailDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} onSubmit={onSubmit} loading={createMut.isPending || updateMut.isPending} memberTypes={memberTypes.data||[]} planTypes={planTypes.data||[]} editing={Boolean(editing)} />
      <ActionResultDialog open={result.open} type={result.type} title={result.title} message={result.message} onOpenChange={(o)=> setResult(r=> ({ ...r, open: o }))} />
    </div>
  );
}

interface PlanDetailDialogProps { open:boolean; onOpenChange:(v:boolean)=>void; form: ReturnType<typeof useForm<PlanDetailForm>>; onSubmit:(v:PlanDetailForm)=>void; loading:boolean; memberTypes:{id:string;name:string}[]; planTypes:{id:string;name:string}[]; editing?: boolean }
function PlanDetailDialog({ open, onOpenChange, form, onSubmit, loading, memberTypes, planTypes, editing }: PlanDetailDialogProps){
  const { register, handleSubmit, formState, watch, setValue } = form;
  const values = watch();
  return (
    <Dialog.Root open={open} onOpenChange={(o)=> !loading && onOpenChange(o)}>
      <Dialog.Content className="max-w-xl">
        <div className="px-6 pt-6 pb-7 space-y-6">
          <Dialog.Header>
            <Dialog.Title>{editing ? 'Edit Plan Detail':'Add Plan Detail'}</Dialog.Title>
          </Dialog.Header>
          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <Select label="Plan Type" required options={planTypes.map(p=> ({ value: p.id, label: p.name }))} value={values.planTypeId} onChange={(v)=> setValue('planTypeId', String(v), { shouldDirty:true, shouldValidate:true })} state={formState.errors.planTypeId ? 'error': values.planTypeId ? 'valid': undefined} helper={formState.errors.planTypeId?.message} />
            <Select label="Member Type" required options={memberTypes.map(m=> ({ value: m.id, label: m.name }))} value={values.memberTypeId} onChange={(v)=> setValue('memberTypeId', String(v), { shouldDirty:true, shouldValidate:true })} state={formState.errors.memberTypeId ? 'error': values.memberTypeId ? 'valid': undefined} helper={formState.errors.memberTypeId?.message} />
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" label="Amount" required {...register('amount')} maxLength={7} value={values.amount} state={formState.errors.amount ? 'error': undefined} helper={formState.errors.amount?.message} />
              <Input type="number" label="Discount (%)" required {...register('discount')} maxLength={4} value={values.discount} state={formState.errors.discount ? 'error': undefined} helper={formState.errors.discount?.message} />
            </div>
            <Input label="Referral Number" {...register('referralNumber')} value={values.referralNumber} maxLength={10} />
            <Input label="Benefits" {...register('benefits')} value={values.benefits} />
            <Select label="Billing Frequency" required value={values.billingFrequency} options={[['Monthly'],['Quarterly'],['Yearly']].map(f=> ({ value: f[0], label: f[0] }))} onChange={(v)=> setValue('billingFrequency', String(v) as PlanDetailForm['billingFrequency'], { shouldDirty:true, shouldValidate:true })} />
            <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>{editing ? 'Update':'Save'}</Button>
          </form>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
