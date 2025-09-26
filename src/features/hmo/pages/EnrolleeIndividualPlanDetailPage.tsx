import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Dialog } from '../../../components/ui/dialog';
import { useState, useEffect } from 'react';
import { useMemberTypes, useCreatePlanDetail } from '../../enrollees/hooks';
import { toastOnce } from '../../../lib/toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/axios';
import { StepHeader } from '../../../components/ui/step-header';
import { BillingFrequency } from '../../../types/enrollee';

const planDetailSchema = z.object({
  planTypeId: z.string().min(1, 'Required'),
  memberTypeId: z.string().min(1, 'Required'),
  amount: z.string().min(1, 'Required').refine(v => /\d/.test(v), 'Must contain digits'),
  discount: z.string().optional(), // handled in transformation
  billingFrequency: z.union([
    z.literal(String(BillingFrequency.Monthly)),
    z.literal(String(BillingFrequency.Quaterly)),
    z.literal(String(BillingFrequency.Yearly)),
  ]).or(z.string().min(1,'Required')),
  referralNumber: z.string().optional(),
  benefits: z.string().optional(),
});
type PlanDetailFormValues = z.infer<typeof planDetailSchema>;

export default function EnrolleeIndividualPlanDetailPage(){
  const [params] = useSearchParams();
  const enrolleeId = params.get('enrolleeId') || '';
  const presetPlanTypeId = params.get('planTypeId') || '';
  const navigate = useNavigate();
  const form = useForm<PlanDetailFormValues>({ resolver: zodResolver(planDetailSchema), defaultValues: { planTypeId: presetPlanTypeId, memberTypeId:'', amount:'', discount:'0', billingFrequency: String(BillingFrequency.Yearly) } });
  const { formState: { errors, touchedFields } } = form;
  const { data: memberTypesData } = useMemberTypes();
  const memberTypes = memberTypesData?.data || [];
  const planTypesQuery = useQuery({ queryKey:['plan-types','all'], queryFn: async ()=> (await api.get('/settings/plan-types')).data.data as {id:string; name:string}[] });
  const planTypes = planTypesQuery.data || [];
  const { mutateAsync: createPlanDetail, isPending } = useCreatePlanDetail();
  const [showSuccess, setShowSuccess] = useState(false);

  // Guard: if no enrollee id, redirect back to individual registration
  useEffect(() => {
    if (!enrolleeId) navigate('/hmo/enrollees/register/individual');
  }, [enrolleeId, navigate]);

  async function onSubmit(values: PlanDetailFormValues){
    try {
      const amountDigits = values.amount.replace(/[^0-9]/g,'').slice(0,7);
      const amount = amountDigits ? Number(amountDigits) : 0;
        const discount = Number((values.discount || '').replace(/[^0-9]/g,'') || 0);
      const bfRaw = values.billingFrequency;
      const billingFrequencyNumericRaw: number | string = /^\d+$/.test(bfRaw) ? Number(bfRaw) : bfRaw; // keep string fallback if non-numeric
      const billingFrequencyCoerced = typeof billingFrequencyNumericRaw === 'number'
        ? (billingFrequencyNumericRaw as unknown as BillingFrequency)
        : billingFrequencyNumericRaw;
      await createPlanDetail({
        planTypeId: values.planTypeId,
        memberTypeId: values.memberTypeId,
        amount,
        discount,
  billingFrequency: billingFrequencyCoerced,
        referralNumber: values.referralNumber || undefined,
        benefits: values.benefits || undefined,
      });
      toastOnce('success','Plan details saved');
      setShowSuccess(true);
    } catch (e: unknown){
      const msg = e instanceof Error ? e.message : 'Failed to save plan details';
      toastOnce('error', msg);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <StepHeader
        current={2}
        steps={[
          { index:1, label:'Enrollee Details' },
          { index:2, label:'Plan Details' },
        ]}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-10 space-y-10 bg-bg">
        <section className="space-y-8">
          <h2 className="tetext-base md:text-lg text-primary font-medium">Plan Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Select label="Plan Type" required disabled={true} state={errors?.planTypeId ? 'error':'default'} helper={errors?.planTypeId?.message as string} value={form.watch('planTypeId')} onChange={v=> form.setValue('planTypeId', String(v), { shouldTouch:true, shouldValidate:true })} options={planTypes.map(pt=> ({ value:pt.id, label:pt.name }))} placeholder={planTypesQuery.isLoading ? 'Loading...' : 'Select'} />
            <Select label="Member Type" required disabled={isPending} state={errors?.memberTypeId ? 'error':'default'} helper={errors?.memberTypeId?.message as string} value={form.watch('memberTypeId')} onChange={v=> form.setValue('memberTypeId', String(v), { shouldTouch:true, shouldValidate:true })} options={memberTypes.map(mt=> ({ value:mt.id, label:mt.name }))} placeholder="Select" />
            <Input label="Amount" required disabled={isPending} state={errors?.amount ? 'error' : touchedFields?.amount ? 'valid':'default'} helper={errors?.amount?.message as string || 'Max 7 digits (auto formatted)'} value={form.watch('amount')} onChange={e=> { const digits = e.target.value.replace(/[^0-9]/g,'').slice(0,7); form.setValue('amount', digits.replace(/\B(?=(\d{3})+(?!\d))/g,','), { shouldTouch:true, shouldValidate:true }); }} />
            <Input label="Discount (%)" disabled={isPending} state={errors?.discount ? 'error' : touchedFields?.discount ? 'valid':'default'} helper={errors?.discount?.message as string} value={form.watch('discount')} onChange={e=> { const d = e.target.value.replace(/[^0-9]/g,'').slice(0,3); form.setValue('discount', d, { shouldTouch:true, shouldValidate:true }); }} />
            <Select label="Billing Frequency" required disabled={isPending} state={errors?.billingFrequency ? 'error':'default'} helper={errors?.billingFrequency?.message as string} value={form.watch('billingFrequency')} onChange={v=> form.setValue('billingFrequency', String(v), { shouldTouch:true, shouldValidate:true })} options={[
              { value: BillingFrequency.Monthly, label: 'Monthly' },
              { value: BillingFrequency.Quaterly, label: 'Quarterly' },
              { value: BillingFrequency.Yearly, label: 'Yearly' },
            ]} placeholder="Select" />
            <Input label="Referral Number" disabled={isPending} state={errors?.referralNumber ? 'error' : touchedFields?.referralNumber ? 'valid':'default'} helper={errors?.referralNumber?.message as string} {...form.register('referralNumber')} />
            <Input label="Benefits" disabled={isPending} state={errors?.benefits ? 'error' : touchedFields?.benefits ? 'valid':'default'} helper={errors?.benefits?.message as string} {...form.register('benefits')} className="md:col-span-2 xl:col-span-3" />
          </div>
        </section>
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" disabled={isPending} onClick={()=> navigate(-1)}>Back</Button>
          <Button type="submit" disabled={isPending} isLoading={isPending} loadingText="Saving...">Save Plan Details</Button>
        </div>
      </form>
      <Dialog.Root open={showSuccess} onOpenChange={o=> { if(!o) setShowSuccess(false); }}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>Enrollee & Plan Created</Dialog.Title>
            <Dialog.Description>Both enrollee basic information and plan details are now saved.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button variant="outline" onClick={()=> { setShowSuccess(false); navigate('/hmo/enrollees/register/individual'); }}>Add Another Individual</Button>
            <Button onClick={()=> navigate('/hmo/enrollees')}>Go To Enrollees</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
