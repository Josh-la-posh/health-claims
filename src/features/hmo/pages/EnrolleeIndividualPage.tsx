import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useCreateEnrollee, useEnrolleeTypes, useEnrolleeClasses, useGenders, useMaritalStatuses, useCountries, useStates, useLgas, useRelationships, usePlanTypes } from '../../enrollees/hooks';
import type { CreateOrUpdateEnrolleePayload } from '../../../types/enrollee';
import { useCorporates } from '../../corporates/hooks';
// removed ad-hoc useQuery for plan types in favor of cached hook
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { PhoneInputWithDialCode } from '../../../components/ui/phone-input';
import { Button } from '../../../components/ui/button';
import { toastOnce } from '../../../lib/toast';
import { StepHeader } from '../../../components/ui/step-header';
import { useState } from 'react';

// Limits reused
const todayISO = new Date().toISOString().slice(0,10);
const LIMITS = { name:15, otherName:15, email:30, phone:15, occupation:15, address:50, nokName:30, nokPhone:15, nokAddress:50 };
// First step schema (no plan detail fields here)
const individualSchema = z.object({
  FirstName: z.string().min(2).max(LIMITS.name),
  LastName: z.string().min(2).max(LIMITS.name),
  OtherName: z.string().max(LIMITS.otherName).optional(),
  Gender: z.string().min(1),
  DateOfBirth: z.string().min(1).refine(d => !!d && d <= todayISO, 'DOB cannot be in the future'),
  PhoneNumber: z.string().min(8).refine(v => v.replace(/[^0-9]/g,'').length <= LIMITS.phone, `Max ${LIMITS.phone} digits`),
  EmailAddress: z.string().email().max(LIMITS.email),
  PlanTypeId: z.string().min(1),
  EnrolleeTypeId: z.string().min(1),
  EnrolleeClassId: z.string().min(1),
  BeneficiaryCorporateId: z.string().optional(),
  FullAddress: z.string().min(5).max(LIMITS.address),
  StateOfResidence: z.string().min(1),
  LGAOfResidence: z.string().min(1),
  Occupation: z.string().min(1).max(LIMITS.occupation),
  MaritalStatus: z.string().min(1),
  Nationality: z.string().min(1),
  Ethnicity: z.string().max(40).optional(),
  nokFullName: z.string().min(2).max(LIMITS.nokName),
  nokRelationship: z.string().min(1),
  nokPhoneNumber: z.string().min(8).refine(v => v.replace(/[^0-9]/g,'').length <= LIMITS.nokPhone, `Max ${LIMITS.nokPhone} digits`),
  nokHomeAddress: z.string().min(5).max(LIMITS.nokAddress),
});
type IndividualForm = z.infer<typeof individualSchema>;

export default function EnrolleeIndividualPage(){
  const navigate = useNavigate();
  const form = useForm<IndividualForm>({ resolver: zodResolver(individualSchema), defaultValues: { Gender:'', DateOfBirth:'', PlanTypeId:'', EnrolleeTypeId:'', EnrolleeClassId:'', FullAddress:'', StateOfResidence:'', LGAOfResidence:'', MaritalStatus:'', Nationality:'' } });
  const { formState: { errors, touchedFields } } = form;
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const selectedStateId = form.watch('StateOfResidence');
  const { data: typesData } = useEnrolleeTypes();
  const { data: classesData } = useEnrolleeClasses();
  const { data: gendersData } = useGenders();
  const { data: maritalData } = useMaritalStatuses();
  const { data: countriesData } = useCountries();
  const { data: statesData } = useStates();
  const { data: lgasData } = useLgas(selectedStateId);
  const { data: relationshipsData } = useRelationships();
  const corporatesQuery = useCorporates();
  const { data: planTypesData, isLoading: planTypesLoading } = usePlanTypes();
  const { mutateAsync: createEnrollee, isPending } = useCreateEnrollee();
  const disableAll = isPending;
  const countries = countriesData?.data || [];
  const states = statesData?.data || [];
  const lgas = lgasData?.data || [];
  const genders = gendersData?.data || [];
  const maritalStatuses = maritalData?.data || [];
  const types = typesData?.data || [];
  const classes = classesData?.data || [];
  const relationships = relationshipsData?.data || [];
  const planTypes = planTypesData?.data || [];
  const corporates = corporatesQuery.data || [];

  async function onSubmit(values: IndividualForm){
    try {
      // Map state/lga
      const stateName = (states || []).find(s=> s.id===values.StateOfResidence)?.name || values.StateOfResidence;
  // const lgaName = (lgas || []).find(l=> l.id===values.LGAOfResidence)?.name || values.LGAOfResidence;
      type EnrolleeWithNok = CreateOrUpdateEnrolleePayload & {
        'NextOfKinCreate.FullName': string;
        'NextOfKinCreate.Relationship': string;
        'NextOfKinCreate.PhoneNumber': string;
        'NextOfKinCreate.HomeAddress': string;
        BeneficiaryCorporateId?: string; // backend may map to corporate relationship
      };
      const enrolleePayload: EnrolleeWithNok = {
        FirstName: values.FirstName,
        LastName: values.LastName,
        OtherName: values.OtherName || undefined,
        PhoneNumber: values.PhoneNumber,
        EmailAddress: values.EmailAddress,
        EnrolleeTypeId: values.EnrolleeTypeId,
        EnrolleeClassId: values.EnrolleeClassId,
        DateOfBirth: values.DateOfBirth,
        FullAddress: values.FullAddress,
        StateOfResidence: stateName,
        Gender: values.Gender,
        Occupation: values.Occupation,
        MaritalStatus: values.MaritalStatus,
        Ethnicity: values.Ethnicity || undefined,
        Nationality: values.Nationality,
        PlanTypeId: values.PlanTypeId,
        // LGAOfResidence: lgaName,
        'NextOfKinCreate.FullName': values.nokFullName,
        'NextOfKinCreate.Relationship': values.nokRelationship,
        'NextOfKinCreate.PhoneNumber': values.nokPhoneNumber,
        'NextOfKinCreate.HomeAddress': values.nokHomeAddress,
      };
      if (photoFile) {
        // backend expects key 'Photo' based on CreateOrUpdateEnrolleePayload
        // (enrolleePayload as unknown as { Photo: File }).Photo = photoFile;
        enrolleePayload.Photo = '';
      }
      if (values.BeneficiaryCorporateId) enrolleePayload.CorporateId = values.BeneficiaryCorporateId;
      const created = await createEnrollee(enrolleePayload);
      toastOnce('success','Enrollee saved. Continue with plan details.');
      // Navigate to plan detail step with enrollee & plan context
      navigate(`/hmo/enrollees/register/individual/plan-details?planTypeId=${values.PlanTypeId}&enrolleeId=${created?.data?.id || ''}`);
    } catch (e: unknown){
      const msg = e instanceof Error ? e.message : 'Failed to register enrollee';
      toastOnce('error', msg);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <StepHeader
        current={1}
        steps={[
          { index:1, label:'Enrollee Details' },
          { index:2, label:'Plan Details' },
        ]}
      />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-14 p-6 md:p-10 bg-bg">
            {/* Photo uploader */}
            <section className="space-y-8">
                <h2 className="text-base md:text-lg text-primary font-medium">Photo</h2>
                <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-medium">
                    {photoPreview ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" /> : 'Img'}
                    </div>
                    <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary">
                        <span>Upload Photo</span>
                        <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={disableAll}
                        onChange={(e)=> {
                            const f = e.target.files?.[0];
                            if (f) {
                            setPhotoFile(f);
                            const url = URL.createObjectURL(f);
                            setPhotoPreview(url);
                            }
                        }}
                        />
                    </label>
                    <p className="text-xs text-muted mt-1">PNG/JPG up to 2MB.</p>
                    </div>
                </div>
            </section>
            <section className="space-y-8">
                <h2 className="text-base md:text-lg text-primary font-medium">Basic Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Input label="First Name" required disabled={disableAll} state={errors.FirstName ? 'error' : touchedFields.FirstName ? 'valid' : 'default'} helper={errors.FirstName?.message as string} {...form.register('FirstName')} />
                    <Input label="Last Name" required disabled={disableAll} state={errors.LastName ? 'error' : touchedFields.LastName ? 'valid' : 'default'} helper={errors.LastName?.message as string} {...form.register('LastName')} />
                    <Input label="Other Name" disabled={disableAll} state={errors.OtherName ? 'error' : touchedFields.OtherName ? 'valid' : 'default'} helper={errors.OtherName?.message as string} {...form.register('OtherName')} />
                    <Select label="Gender" required disabled={disableAll} state={errors.Gender ? 'error':'default'} helper={errors.Gender?.message as string} value={form.watch('Gender')} onChange={v=> form.setValue('Gender', String(v), { shouldValidate:true, shouldTouch:true })} options={genders.map(g=> ({ value:g, label:g }))} placeholder="Select" />
                    <Input label="Date of Birth" type="date" required disabled={disableAll} state={errors.DateOfBirth ? 'error' : touchedFields.DateOfBirth ? 'valid' : 'default'} helper={errors.DateOfBirth?.message as string} {...form.register('DateOfBirth')} />
                    <PhoneInputWithDialCode label="Phone Number" value={form.watch('PhoneNumber')} onChange={v=> { form.setValue('PhoneNumber', v, { shouldValidate:true, shouldTouch:true }); }} countries={countries} disabled={disableAll} required />
                    <Input label="Email" required disabled={disableAll} state={errors.EmailAddress ? 'error' : touchedFields.EmailAddress ? 'valid' : 'default'} helper={errors.EmailAddress?.message as string} {...form.register('EmailAddress')} />
                    <Input label="Occupation" required disabled={disableAll} state={errors.Occupation ? 'error' : touchedFields.Occupation ? 'valid' : 'default'} helper={errors.Occupation?.message as string} {...form.register('Occupation')} />
                    <Select label="Marital Status" required disabled={disableAll} state={errors.MaritalStatus ? 'error':'default'} helper={errors.MaritalStatus?.message as string} value={form.watch('MaritalStatus')} onChange={v=> form.setValue('MaritalStatus', String(v), { shouldValidate:true, shouldTouch:true })} options={maritalStatuses.map(m=> ({ value:m, label:m }))} placeholder="Select" />
                    <Select label="Nationality" searchable required disabled={disableAll} state={errors.Nationality ? 'error':'default'} helper={errors.Nationality?.message as string} value={form.watch('Nationality')} onChange={v=> form.setValue('Nationality', String(v), { shouldValidate:true, shouldTouch:true })} options={countries.map(c=> ({ value:c.name, label:c.name }))} placeholder="Select" />
                    <Input label="Ethnicity" disabled={disableAll} state={errors.Ethnicity ? 'error' : touchedFields.Ethnicity ? 'valid' : 'default'} helper={errors.Ethnicity?.message as string} {...form.register('Ethnicity')} />
                    <Select label="Plan Type" required disabled={disableAll || planTypesLoading} state={errors.PlanTypeId ? 'error':'default'} helper={errors.PlanTypeId?.message as string} value={form.watch('PlanTypeId')} onChange={v=> form.setValue('PlanTypeId', String(v), { shouldValidate:true, shouldTouch:true })} options={planTypes.map(pt=> ({ value:pt.id, label:pt.name }))} placeholder={planTypesLoading ? 'Loading...' : 'Select'} />
                    <Select label="Enrollee Type" required disabled={disableAll} state={errors.EnrolleeTypeId ? 'error':'default'} helper={errors.EnrolleeTypeId?.message as string} value={form.watch('EnrolleeTypeId')} onChange={v=> form.setValue('EnrolleeTypeId', String(v), { shouldValidate:true, shouldTouch:true })} options={types.map(t=> ({ value:t.id, label:t.name }))} placeholder="Select" />
                    <Select label="Enrollee Class" required disabled={disableAll} state={errors.EnrolleeClassId ? 'error':'default'} helper={errors.EnrolleeClassId?.message as string} value={form.watch('EnrolleeClassId')} onChange={v=> form.setValue('EnrolleeClassId', String(v), { shouldValidate:true, shouldTouch:true })} options={classes.map(c=> ({ value:c.id, label:c.name }))} placeholder="Select" />
                    <Select label="Beneficiary" disabled={disableAll || corporatesQuery.isLoading} state={errors.BeneficiaryCorporateId ? 'error':'default'} helper={errors.BeneficiaryCorporateId?.message as string} value={form.watch('BeneficiaryCorporateId')} onChange={v=> form.setValue('BeneficiaryCorporateId', String(v), { shouldValidate:true, shouldTouch:true })} options={ (corporates||[]).map(c=> ({ value:c.id, label:c.companyName })) } placeholder={corporatesQuery.isLoading ? 'Loading...' : 'Select (optional)'} />
                    <Input label="Full Address" required disabled={disableAll} state={errors.FullAddress ? 'error' : touchedFields.FullAddress ? 'valid' : 'default'} helper={errors.FullAddress?.message as string} {...form.register('FullAddress')} className="md:col-span-2" />
                    <Select label="State of Residence" required disabled={disableAll} state={errors.StateOfResidence ? 'error':'default'} helper={errors.StateOfResidence?.message as string} value={form.watch('StateOfResidence')} onChange={v=> { form.setValue('StateOfResidence', String(v), { shouldValidate:true, shouldTouch:true }); form.setValue('LGAOfResidence',''); }} options={states.map(s=> ({ value:s.id, label:s.name }))} placeholder="Select" />
                    <Select label="LGA of Residence" required disabled={disableAll || !form.watch('StateOfResidence')} state={errors.LGAOfResidence ? 'error':'default'} helper={errors.LGAOfResidence?.message as string} value={form.watch('LGAOfResidence')} onChange={v=> form.setValue('LGAOfResidence', String(v), { shouldValidate:true, shouldTouch:true })} options={lgas.map(l=> ({ value:l.id, label:l.name }))} placeholder={form.watch('StateOfResidence') ? 'Select' : 'Select state first'} />
                </div>
            </section>
            <hr className="border-t border-border" />
            <section className="space-y-8">
                <h2 className="text-base md:text-lg text-primary font-medium">Next Of Kin</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Input label="Full Name" required disabled={disableAll} state={errors.nokFullName ? 'error' : touchedFields.nokFullName ? 'valid' : 'default'} helper={errors.nokFullName?.message as string} {...form.register('nokFullName')} />
                    <Select label="Relationship" required disabled={disableAll} state={errors.nokRelationship ? 'error':'default'} helper={errors.nokRelationship?.message as string} value={form.watch('nokRelationship')} onChange={v=> form.setValue('nokRelationship', String(v), { shouldValidate:true, shouldTouch:true })} options={relationships.map(r=> ({ value:r, label:r }))} placeholder="Select" />
                    <PhoneInputWithDialCode label="Phone Number" value={form.watch('nokPhoneNumber')} onChange={v=> { form.setValue('nokPhoneNumber', v, { shouldValidate:true, shouldTouch:true }); }} countries={countries} disabled={disableAll} required />
                    <Input label="Home Address" required disabled={disableAll} state={errors.nokHomeAddress ? 'error' : touchedFields.nokHomeAddress ? 'valid' : 'default'} helper={errors.nokHomeAddress?.message as string} {...form.register('nokHomeAddress')} />
                </div>
            </section>
            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" disabled={disableAll} onClick={()=> navigate('/hmo/enrollees/register')}>Back</Button>
                <Button type="submit" disabled={disableAll} isLoading={disableAll} loadingText="Saving...">Continue → Plan Details</Button>
            </div>
        </form>
    </div>
  );
}
