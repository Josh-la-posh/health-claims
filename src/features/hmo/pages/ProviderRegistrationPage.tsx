import { useState, useMemo } from 'react';
import { useForm, useFieldArray, type FieldPath, type FieldPathValue } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useBanks, useCreateProvider, type CreateProviderRequest } from '../api/providersApi';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { PhoneInputWithDialCode, type DialCodeCountry } from '../../../components/ui/phone-input';
import { useCountries } from '../../../features/enrollees/hooks';
import { ActionResultDialog } from '../../../components/ui/action-result-dialog';

const nameNoDigits = /^[^0-9]+$/;
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const accountNumberRegex = /^\d{10}$/;
const bvnRegex = /^\d{11}$/; // Bank Verification Number must be 11 digits
const phoneRegex = /^\+?[0-9]{8,20}$/; // already sanitized by component but validate anyway

const contactSchema = z.object({
  name: z.string().min(1,'Name required').regex(nameNoDigits,'Name cannot contain digits').max(60),
  designation: z.string().max(30,'Max 30 chars').optional().or(z.literal('')),
  email: z.string().min(1,'Email required').regex(emailRegex,'Invalid email').max(50),
  phoneNumber: z.string().min(1,'Phone required').regex(phoneRegex,'Invalid phone'),
});

const providerSchema = z.object({
  hospitalName: z.string().min(1,'Required').regex(nameNoDigits,'Name cannot contain digits').max(120),
  email: z.string().min(1,'Required').regex(emailRegex,'Invalid email').max(50),
  hospitalAdress: z.string().min(1,'Required').max(160),
  phoneNumber: z.string().min(1,'Required').regex(phoneRegex,'Invalid phone'),
  bankName: z.string().min(1,'Required'),
  bankCode: z.string().min(1,'Required'),
  accountNumber: z.string().regex(accountNumberRegex,'Account number must be 10 digits'),
  accountName: z.string().min(1,'Required').regex(nameNoDigits,'Name cannot contain digits').max(120),
  accountType: z.enum(['1','2','3','4','5','6','7'], { required_error: 'Required' }),
  indemnityNumber: z.string().min(1,'Required').max(20),
  stateLicenseNumber: z.string().min(1,'Required').max(20),
  licenseExpiryDate: z.string().min(1,'Required'),
  tariffBand: z.string().min(1,'Required').max(10),
  indemnityExpiryDate: z.string().min(1,'Required'),
  geoLocation: z.string().min(1,'Required').max(50),
  bankVeririfationNumber: z.string().regex(bvnRegex,'BVN must be 11 digits'),
  contacts: z.array(contactSchema).min(1,'At least one contact required')
});
type ProviderFormState = z.infer<typeof providerSchema>;

export default function ProviderRegistrationPage(){
  const [step, setStep] = useState<1|2>(1);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { data: banks } = useBanks();
  const createMutation = useCreateProvider();
  const form = useForm<ProviderFormState>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      hospitalName:'', email:'', hospitalAdress:'', phoneNumber:'', bankName:'', accountNumber:'', bankCode:'', accountName:'', accountType: undefined, bankVeririfationNumber:'', stateLicenseNumber:'', licenseExpiryDate:'', geoLocation:'', tariffBand:'', indemnityNumber:'', indemnityExpiryDate:'', contacts: [{ name:'', designation:'', email:'', phoneNumber:'' }]
    } as Partial<ProviderFormState>
  });
  const { control, watch, setValue, handleSubmit, formState } = form;
  const contactsFieldArray = useFieldArray({ control, name: 'contacts' });

  // Fetch countries via shared enrollee resources hook (already used in enrollee registration)
  const { data: countriesData } = useCountries();
  const countries: DialCodeCountry[] = (countriesData?.data || []).map(c => ({
    name: c.name,
    alpha2: 'alpha2' in c && typeof (c as { alpha2?: unknown }).alpha2 === 'string' && (c as { alpha2: string }).alpha2
      ? (c as { alpha2: string }).alpha2
      : c.name.slice(0,2).toUpperCase(),
    dailingCodes: Array.isArray(c.dailingCodes) && c.dailingCodes.length ? c.dailingCodes : ['234']
  }));

  const bankOptions = useMemo(() => (banks || []).map(b => ({ value: `${b.code}-${b.id}` , label: b.name, code: b.code, name: b.name })), [banks]);
  // Backend expects numeric codes 1-7 mapped to specific labels
  const accountTypeMap: { value: string; label: string }[] = [
    { value: '1', label: 'Domiciliary' },
    { value: '2', label: 'Current' },
    { value: '3', label: 'Fixed Deposit' },
    { value: '4', label: 'Joint' },
    { value: '5', label: 'Savings' },
    { value: '6', label: 'Corporate' },
    { value: '7', label: 'Non-Resident Nigerian' },
  ];
  const accountTypeOptions = accountTypeMap;

  function sanitizeAndSet<K extends FieldPath<ProviderFormState>>(key: K, value: FieldPathValue<ProviderFormState, K>) {
    let v = value;
    if ((key === 'accountNumber' || key === 'bankVeririfationNumber') && typeof v === 'string') {
      v = v.replace(/[^0-9]/g, '') as FieldPathValue<ProviderFormState, K>;
    }
    setValue(key, v, { shouldValidate: true, shouldDirty: true });
  }

  const providerValues = watch();
  const providerValid = Object.keys(formState.errors).length === 0 && providerValues.contacts?.length>0;
  const contactsValid = providerValues.contacts?.length>0 && providerValues.contacts.every((_,i)=> !formState.errors.contacts?.[i]);

  const onSubmit = async (values: ProviderFormState) => {
    if(!providerValid || !contactsValid) return;
    // Normalize phone numbers (already emitted like +234XXXXXXXX, just ensure no spaces)
    const normalize = (p: string) => p.replace(/\s+/g,'');
    const payload: CreateProviderRequest = {
      hospitalName: values.hospitalName,
      email: values.email,
      hospitalAdress: values.hospitalAdress,
      phoneNumber: normalize(values.phoneNumber),
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      bankCode: values.bankCode,
      accountName: values.accountName,
    accountType: values.accountType,
    bankVeririfationNumber: values.bankVeririfationNumber,
      stateLicenseNumber: values.stateLicenseNumber,
      licenseExpiryDate: values.licenseExpiryDate || new Date().toISOString(),
      geoLocation: values.geoLocation,
      contacts: values.contacts.map(c => ({ name: c.name, designation: c.designation || '', email: c.email, phoneNumber: normalize(c.phoneNumber) })),
    };
    try {
      await createMutation.mutateAsync(payload);
      setSuccessOpen(true);
    } catch (e: unknown) {
      function extractMessage(err: unknown): string {
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const resp = (err as { response?: { data?: { message?: unknown }}}).response;
          const maybe = resp?.data?.message;
          if (typeof maybe === 'string' && maybe.trim()) return maybe;
        }
        if (err instanceof Error) return err.message;
        return 'Failed to create provider.';
      }
      setErrorMsg(extractMessage(e));
      setErrorOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-authBg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <nav className="flex items-center gap-4 text-sm font-medium">
          <button type="button" className={step===1 ? 'text-primary flex items-center gap-2' : 'text-muted-foreground flex items-center gap-2'} onClick={()=>setStep(1)}>
            <span className={`size-5 rounded-full border flex items-center justify-center text-[10px] ${step===1 ? 'border-primary text-primary' : 'border-border bg-primary'}`}>{step===1?1:'✓'}</span>
            Provider Details
          </button>
          <span className="opacity-50">›</span>
          <button type="button" className={step===2 ? 'text-primary flex items-center gap-2' : 'text-muted-foreground flex items-center gap-2'} onClick={()=> providerValid && setStep(2)}>
            <span className={`size-5 rounded-full border flex items-center justify-center text-[10px] ${step===2 ? 'border-primary text-primary' : 'border-border'}`}>{step===2?2:''}</span>
            Primary Contact Details
          </button>
        </nav>

        {step===1 && (
          <div className="bg-bg border border-border rounded-xl p-6 md:p-8 space-y-10">
            <h3 className="text-base md:text-xl font-medium text-primary tracking-wide">Basic Info</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Input required label="Hospital Name" value={providerValues.hospitalName} onChange={e=>sanitizeAndSet('hospitalName', e.target.value)} state={formState.errors.hospitalName ? 'error': providerValues.hospitalName ? 'valid': undefined} helper={formState.errors.hospitalName?.message as string} />
              <Input required type="email" label="Email" value={providerValues.email} onChange={e=>sanitizeAndSet('email', e.target.value)} state={formState.errors.email ? 'error': providerValues.email ? 'valid': undefined} helper={formState.errors.email?.message as string} />
              <Input required label="Hospital Address" value={providerValues.hospitalAdress} onChange={e=>sanitizeAndSet('hospitalAdress', e.target.value)} state={formState.errors.hospitalAdress ? 'error': providerValues.hospitalAdress ? 'valid': undefined} helper={formState.errors.hospitalAdress?.message as string} />
              <PhoneInputWithDialCode
                countries={countries}
                value={providerValues.phoneNumber}
                onChange={(val)=> sanitizeAndSet('phoneNumber', val)}
                label="Phone Number"
                maxLocalLength={20}
                required
                state={formState.errors.phoneNumber ? 'error' : providerValues.phoneNumber ? 'valid' : undefined}
                helper={formState.errors.phoneNumber?.message as string}
              />
              <Select
                searchable
                options={bankOptions.map(o=> ({ value: o.value, label: o.label }))}
                value={providerValues.bankCode ? bankOptions.find(o=> o.code===providerValues.bankCode)?.value : ''}
                onChange={(v)=> { const opt = bankOptions.find(o=> o.value === v); if(opt){ sanitizeAndSet('bankName', opt.name); sanitizeAndSet('bankCode', opt.code); } }}
                required
                label="Bank Name"
                // bank error keyed on bankName
                helper={formState.errors.bankName?.message as string}
                state={formState.errors.bankName ? 'error' : providerValues.bankName ? 'valid': undefined}
              />
              <Input required label="Account Number" value={providerValues.accountNumber} onChange={e=>sanitizeAndSet('accountNumber', e.target.value)} state={formState.errors.accountNumber ? 'error': providerValues.accountNumber ? 'valid': undefined} helper={formState.errors.accountNumber?.message as string} />
              <Input required label="Account Name" value={providerValues.accountName} onChange={e=>sanitizeAndSet('accountName', e.target.value)} state={formState.errors.accountName ? 'error': providerValues.accountName ? 'valid': undefined} helper={formState.errors.accountName?.message as string} />
              <Input required label="Bank Verification Number (BVN)" maxLength={11} value={providerValues.bankVeririfationNumber} onChange={e=>sanitizeAndSet('bankVeririfationNumber', e.target.value)} state={formState.errors.bankVeririfationNumber ? 'error': providerValues.bankVeririfationNumber ? (providerValues.bankVeririfationNumber.length===11 ? 'valid': undefined) : undefined} helper={formState.errors.bankVeririfationNumber?.message as string} />
              <Select
                label="Account Type"
                required
                options={accountTypeOptions}
                value={providerValues.accountType || ''}
                onChange={(v)=> sanitizeAndSet('accountType', v as ProviderFormState['accountType'])}
                helper={formState.errors.accountType?.message as string}
                state={formState.errors.accountType ? 'error' : providerValues.accountType ? 'valid' : undefined}
                placeholder="Select"
              />
              <Input required label="Professional Indemnity Number" value={providerValues.indemnityNumber} onChange={e=>sanitizeAndSet('indemnityNumber', e.target.value)} state={formState.errors.indemnityNumber ? 'error' : providerValues.indemnityNumber ? 'valid' : undefined} helper={formState.errors.indemnityNumber?.message as string} />
              <Input required label="State License Number" value={providerValues.stateLicenseNumber} onChange={e=>sanitizeAndSet('stateLicenseNumber', e.target.value)} state={formState.errors.stateLicenseNumber ? 'error' : providerValues.stateLicenseNumber ? 'valid' : undefined} helper={formState.errors.stateLicenseNumber?.message as string} />
              <Input required type="date" label="License Expiry Date" value={providerValues.licenseExpiryDate} onChange={e=>sanitizeAndSet('licenseExpiryDate', e.target.value)} state={formState.errors.licenseExpiryDate ? 'error' : providerValues.licenseExpiryDate ? 'valid' : undefined} helper={formState.errors.licenseExpiryDate?.message as string} />
              <Input required label="Tariff Band" value={providerValues.tariffBand} onChange={e=>sanitizeAndSet('tariffBand', e.target.value)} state={formState.errors.tariffBand ? 'error' : providerValues.tariffBand ? 'valid' : undefined} helper={formState.errors.tariffBand?.message as string} />
              <Input required type="date" label="Indemnity Number Expiry Date" value={providerValues.indemnityExpiryDate} onChange={e=>sanitizeAndSet('indemnityExpiryDate', e.target.value)} state={formState.errors.indemnityExpiryDate ? 'error' : providerValues.indemnityExpiryDate ? 'valid' : undefined} helper={formState.errors.indemnityExpiryDate?.message as string} />
              <Input required label="Geo-location" value={providerValues.geoLocation} onChange={e=>sanitizeAndSet('geoLocation', e.target.value)} state={formState.errors.geoLocation ? 'error' : providerValues.geoLocation ? 'valid' : undefined} helper={formState.errors.geoLocation?.message as string} />
            </div>
            <div className="pt-4 w-full flex justify-end">
              <Button onClick={async ()=> {
                const ok = await form.trigger(['hospitalName','email','hospitalAdress','phoneNumber','bankName','bankCode','accountNumber','accountName','bankVeririfationNumber','accountType','indemnityNumber','stateLicenseNumber','licenseExpiryDate','tariffBand','indemnityExpiryDate','geoLocation']);
                if(ok) setStep(2);
              }} disabled={!providerValid}>Next</Button>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="bg-bg border border-border rounded-xl p-6 md:p-8 space-y-10">
            {contactsFieldArray.fields.map((_, idx) => (
              <div key={idx} className="space-y-5">
                <h3 className="text-sm md:text-base font-medium text-primary">Contact {idx+1}</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Input label="Full Name" value={providerValues.contacts?.[idx]?.name || ''} onChange={e=> { setValue(`contacts.${idx}.name`, e.target.value, { shouldValidate:true, shouldDirty:true }); }} state={formState.errors.contacts?.[idx]?.name ? 'error' : providerValues.contacts?.[idx]?.name ? 'valid': undefined} helper={formState.errors.contacts?.[idx]?.name?.message as string | undefined} />
                  <Input type="email" label="Email" value={providerValues.contacts?.[idx]?.email || ''} onChange={e=> { setValue(`contacts.${idx}.email`, e.target.value, { shouldValidate:true, shouldDirty:true }); }} state={formState.errors.contacts?.[idx]?.email ? 'error' : providerValues.contacts?.[idx]?.email ? 'valid': undefined} helper={formState.errors.contacts?.[idx]?.email?.message as string | undefined} />
                  <PhoneInputWithDialCode
                    countries={countries}
                    value={providerValues.contacts?.[idx]?.phoneNumber || ''}
                    onChange={(val)=> { setValue(`contacts.${idx}.phoneNumber`, val, { shouldValidate:true, shouldDirty:true }); }}
                    label="Phone Number"
                    maxLocalLength={20}
                    state={formState.errors.contacts?.[idx]?.phoneNumber ? 'error' : providerValues.contacts?.[idx]?.phoneNumber ? 'valid': undefined}
                    helper={formState.errors.contacts?.[idx]?.phoneNumber?.message as string | undefined}
                  />
                  <Input label="Designation" value={providerValues.contacts?.[idx]?.designation || ''} onChange={e=> { setValue(`contacts.${idx}.designation`, e.target.value, { shouldValidate:true, shouldDirty:true }); }} />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-6">
              <Button variant="outline" onClick={()=>setStep(1)}>Back</Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={()=> contactsFieldArray.append({ name:'', designation:'', email:'', phoneNumber:'' })}>Add Contact</Button>
                <Button onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending}>{createMutation.isPending ? 'Submitting...' : 'Submit'}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ActionResultDialog
        open={successOpen}
        onOpenChange={(v)=> { setSuccessOpen(v); if(!v) navigate('/hmo/providers'); }}
        type="success"
        title="Provider Created"
        message="The provider has been registered successfully."
        autoCloseMs={3000}
      />
      <ActionResultDialog
        open={errorOpen}
        onOpenChange={setErrorOpen}
        type="error"
        title="Creation Failed"
        message={errorMsg || 'Unable to create provider.'}
      />
    </div>
  );
}