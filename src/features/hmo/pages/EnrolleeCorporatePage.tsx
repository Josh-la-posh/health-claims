import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { PhoneInputWithDialCode } from '../../../components/ui/phone-input';
import { Button } from '../../../components/ui/button';
import { Dialog } from '../../../components/ui/dialog';
import { useState } from 'react';
import { useEnrolleeClasses } from '../../enrollees/hooks';
import { useCreateCorporate } from '../../corporates/hooks';
import { toastOnce } from '../../../lib/toast';
import { CorporateType, CorporateCategory } from '../../../types/enrollee';

const corpSchema = z.object({
  corporateType: z.string().min(1,'Corporate type is required'),
  corporateCatgory: z.string().min(1,'Corporate category is required'),
  companyName: z.string().min(2,'Company name is required').max(50,'Max 50 characters'),
  email: z.string().min(1,'Email is required').email('Enter a valid email').max(50,'Max 50 characters'),
  phoneNumber: z
    .string()
    .min(8,'Phone number is too short')
    .regex(/^\+?\d{8,20}$/,'Enter digits only (8-20) optionally starting with +'),
  officeAddress: z.string().min(5,'Office address is required').max(100,'Max 100 characters'),
  enrolleeClassId: z.string().min(1,'Enrollee class is required'),
  contactPerson: z.string().min(1,'Contact person is required').max(50,'Max 50 characters'),
});
type CorporateForm = z.infer<typeof corpSchema>;

export default function EnrolleeCorporatePage(){
  const navigate = useNavigate();
  const form = useForm<CorporateForm>({ resolver: zodResolver(corpSchema), defaultValues: { corporateType:'', corporateCatgory:'', companyName:'', email:'', phoneNumber:'', officeAddress:'', enrolleeClassId:'', contactPerson:'' } });
  const { formState: { errors, touchedFields } } = form;
  const { data: classesData } = useEnrolleeClasses();
  const classes = classesData?.data || [];
  const { mutateAsync, isPending } = useCreateCorporate();
  const [showSuccess, setShowSuccess] = useState(false);
  const corporateTypes = [
    { label:'Employer', value: String(CorporateType.Employer) },
    { label:'TPA', value: String(CorporateType.TPA) },
    { label:'Sponsor', value: String(CorporateType.Sponsor) },
  ];
  const corporateCategories = [
    { label: 'Bank', value: String(CorporateCategory.Bank) },
    { label: 'NGO', value: String(CorporateCategory.NGO) },
    { label: 'Church', value: String(CorporateCategory.Church) },
    { label: 'Agency', value: String(CorporateCategory.Agency) },
  ];

  async function onSubmit(values: CorporateForm){
    try {
      const corporateTypeValue: string | CorporateType = /^\d+$/.test(values.corporateType)
        ? (Number(values.corporateType) as CorporateType)
        : values.corporateType;
      const corporateCategoryValue: string | CorporateCategory = /^\d+$/.test(values.corporateCatgory)
        ? (Number(values.corporateCatgory) as CorporateCategory)
        : values.corporateCatgory;
      await mutateAsync({
        corporateType: corporateTypeValue,
        corporateCatgory: corporateCategoryValue,
        companyName: values.companyName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        officeAddress: values.officeAddress,
        enrolleeClassId: values.enrolleeClassId,
      });
      toastOnce('success','Corporate created');
      setShowSuccess(true);
    } catch (e: unknown){
      const msg = e instanceof Error ? e.message : 'Failed to create corporate';
      toastOnce('error', msg);
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-bg space-y-10 p-6 md:p-10 w-full mx-auto">
        <section className="space-y-6">
          <h2 className="text-lg md:text-2xl font-medium text-primary">Corporate Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Corporate type" required disabled={isPending}
              state={errors.corporateType ? 'error' : touchedFields.corporateType ? 'valid' : 'default'}
              helper={errors.corporateType?.message as string}
              value={form.watch('corporateType')}
              onChange={v=> form.setValue('corporateType', String(v), { shouldValidate:true, shouldTouch:true })}
              options={corporateTypes} placeholder="Select" />
            <Select label="Corporate category" required disabled={isPending}
              state={errors.corporateCatgory ? 'error' : touchedFields.corporateCatgory ? 'valid' : 'default'}
              helper={errors.corporateCatgory?.message as string}
              value={form.watch('corporateCatgory')}
              onChange={v=> form.setValue('corporateCatgory', String(v), { shouldValidate:true, shouldTouch:true })}
              options={corporateCategories} placeholder="Select" />
            <Input label="Company name" required disabled={isPending} maxLength={50}
              state={errors.companyName ? 'error' : touchedFields.companyName ? 'valid' : 'default'}
              helper={errors.companyName?.message as string}
              {...form.register('companyName')} />
            <Input label="Email" required disabled={isPending} maxLength={50}
              state={errors.email ? 'error' : touchedFields.email ? 'valid' : 'default'}
              helper={errors.email?.message as string}
              {...form.register('email')} />
            <Input label="Office address" required disabled={isPending} maxLength={100}
              state={errors.officeAddress ? 'error' : touchedFields.officeAddress ? 'valid' : 'default'}
              helper={errors.officeAddress?.message as string}
              {...form.register('officeAddress')} className="md:col-span-2" />
            <PhoneInputWithDialCode label="Phone Number" required disabled={isPending}
              state={errors.phoneNumber ? 'error' : touchedFields.phoneNumber ? 'valid' : 'default'}
              helper={errors.phoneNumber?.message as string}
              value={form.watch('phoneNumber')}
              onChange={v=> form.setValue('phoneNumber', v, { shouldValidate:true, shouldTouch:true })}
              countries={[]} />
            <Input label="Contact person" required disabled={isPending} maxLength={50}
              state={errors.contactPerson ? 'error' : touchedFields.contactPerson ? 'valid' : 'default'}
              helper={errors.contactPerson?.message as string}
              {...form.register('contactPerson')} />
            <Select label="Enrollee Class" required disabled={isPending}
              state={errors.enrolleeClassId ? 'error' : touchedFields.enrolleeClassId ? 'valid' : 'default'}
              helper={errors.enrolleeClassId?.message as string}
              value={form.watch('enrolleeClassId')}
              onChange={v=> form.setValue('enrolleeClassId', String(v), { shouldValidate:true, shouldTouch:true })}
              options={classes.map(c=> ({ value:c.id, label:c.name }))} placeholder="Select" />
          </div>
        </section>
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" disabled={isPending} onClick={()=> navigate('/hmo/enrollees/register')}>Back</Button>
          <Button type="submit" disabled={isPending} isLoading={isPending} loadingText="Saving...">Save Corporate</Button>
        </div>
      </form>
      <Dialog.Root open={showSuccess} onOpenChange={o=> { if(!o) setShowSuccess(false); }}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>Corporate Created</Dialog.Title>
            <Dialog.Description>Corporate enrollee saved successfully.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button variant="outline" onClick={()=> { setShowSuccess(false); navigate('/hmo/enrollees/register/corporate'); }}>Add Another</Button>
            <Button onClick={()=> navigate('/hmo/enrollees?view=corporate')}>Go To Enrollees</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
