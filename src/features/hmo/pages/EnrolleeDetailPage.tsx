import { useParams, useLocation } from 'react-router-dom';
import { useEnrollee, useActivateEnrollee, useDeactivateEnrollee, useUpdateEnrollee, useUpdateNextOfKin, useGenders, useMaritalStatuses, useCountries, useRelationships, usePlanTypes, useEnrolleeTypes, useEnrolleeClasses, useDependents, useCreateDependent, useUpdateDependent } from '../../enrollees/hooks';
import type { Dependent } from '../../../types/enrollee';
import { Button } from '../../../components/ui/button';
import { Dialog } from '../../../components/ui/dialog';
import { useState, useMemo } from 'react';
import { Pencil } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { PhoneInputWithDialCode } from '../../../components/ui/phone-input';
import { PageTabs } from '../../../components/system/PageTabs';
import { formatCurrency } from '../../../utils/currency';
import { cn } from '../../../utils/cn';

export default function EnrolleeDetailPage(){
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useEnrollee(id);
  const enrollee = data?.data;
  const activate = useActivateEnrollee(id || '');
  const deactivate = useDeactivateEnrollee(id || '');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');
  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editNokOpen, setEditNokOpen] = useState(false);
  // Dependents UI state
  const [createDepOpen, setCreateDepOpen] = useState(false);
  const [editDepOpen, setEditDepOpen] = useState(false);
  const [editDep, setEditDep] = useState<Dependent | null>(null);
  // Dependents data (prefer dedicated endpoint so updates reflect immediately)
  const { data: dependentsData, isLoading: depsLoading } = useDependents(id);
  // Fallback to enrollee detail embedded dependents if endpoint not yet returning
  const dependents = dependentsData?.data || enrollee?.dependents || [];
  const createDepMut = useCreateDependent(id || '');
  const updateDepMut = useUpdateDependent(id || '', editDep?.id || '');
  const location = useLocation();
  // Determine current tab from pathname
  const basePath = `/hmo/enrollees/${id}`;
  const currentTab = location.pathname.endsWith('/plan')
    ? 'plan'
    : location.pathname.endsWith('/dependents')
      ? 'dependents'
      : 'personal';

  const fullName = useMemo(()=> enrollee ? [enrollee.firstName, enrollee.lastName].filter(Boolean).join(' ') : '', [enrollee]);

  async function handleToggle(){
    if(!enrollee || !id) return;
    try {
      if(enrollee.isActive){
        await deactivate.mutateAsync();
        setDialogMsg('Enrollee deactivated successfully');
      } else {
        await activate.mutateAsync();
        setDialogMsg('Enrollee activated successfully');
      }
      setShowDialog(true);
    } catch{
      // TODO: surface error toast
    }
  }

  // Lookups for edit forms
  const { data: gendersData } = useGenders();
  const { data: maritalData } = useMaritalStatuses();
  const { data: countriesData } = useCountries();
  const { data: relationshipsData } = useRelationships();
  const { data: planTypesData } = usePlanTypes();
  const { data: enrolleeTypesData } = useEnrolleeTypes();
  const { data: enrolleeClassesData } = useEnrolleeClasses();
  const genders = gendersData?.data || [];
  const maritalStatuses = maritalData?.data || [];
  const countries = countriesData?.data || [];
  const relationships = relationshipsData?.data || [];
  const planTypes = planTypesData?.data || [];
  const enrolleeTypes = enrolleeTypesData?.data || [];
  const enrolleeClasses = enrolleeClassesData?.data || [];

  function resolveName(id: string | undefined, fallbackObj?: { name?: string }): string | undefined {
    if(!id) return fallbackObj?.name;
    // check plan types
    const anyHit = planTypes.find(p=> p.id===id) || enrolleeTypes.find(t=> t.id===id) || enrolleeClasses.find(c=> c.id===id);
    return anyHit?.name || fallbackObj?.name;
  }

  const updateEnrolleeMut = useUpdateEnrollee(id || '');
  const nokId = enrollee?.nextOfKin?.id;
  const updateNokMut = useUpdateNextOfKin(id || '', nokId || '');

  function buildDirtyPayload(original: Record<string, unknown>, updated: Record<string, unknown>){
    const dirty: Record<string, unknown> = {};
    Object.keys(updated).forEach(k => {
      if(updated[k] !== original[k]) dirty[k] = updated[k];
    });
    return dirty;
  }

  async function submitPersonal(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!enrollee) return;
    const formData = new FormData(e.currentTarget);
  const updated: Record<string, unknown> = {};
    formData.forEach((v,k)=> { updated[k] = v; });
    const original = {
      FirstName: enrollee.firstName,
      LastName: enrollee.lastName,
      OtherName: enrollee.otherName,
      PhoneNumber: enrollee.phoneNumber,
      EmailAddress: enrollee.emailAddress,
      EnrolleeTypeId: enrollee.enrolleeType?.id,
      EnrolleeClassId: enrollee.enrolleeClass?.id,
      DateOfBirth: enrollee.dateOfBirth?.slice(0,10),
      FullAddress: enrollee.fullAddress,
      StateOfResidence: enrollee.stateOfResidence,
      Gender: enrollee.gender,
      Occupation: enrollee.occupation,
      MaritalStatus: enrollee.maritalStatus,
      Ethnicity: enrollee.ethnicity,
      Nationality: enrollee.nationality,
    };
    const payload = buildDirtyPayload(original, updated);
    if(Object.keys(payload).length === 0){ setEditPersonalOpen(false); return; }
    try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateEnrolleeMut.mutateAsync(payload as any); // existing mutation expects payload shape
      setDialogMsg('Personal information updated');
      setShowDialog(true);
      setEditPersonalOpen(false);
  } catch {/* TODO: add toast */}
  }

  async function submitNok(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!enrollee || !nokId) return;
    const formData = new FormData(e.currentTarget);
  const updated: Record<string, unknown> = {};
    formData.forEach((v,k)=> { updated[k] = v; });
    const original = {
      fullName: enrollee.nextOfKin?.fullName,
      relationship: enrollee.nextOfKin?.relationship,
      phoneNumber: enrollee.nextOfKin?.phoneNumber,
      homeAddress: enrollee.nextOfKin?.homeAddress,
    };
    const payload = buildDirtyPayload(original, updated);
    if(Object.keys(payload).length === 0){ setEditNokOpen(false); return; }
    try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateNokMut.mutateAsync({ ...payload, id: nokId, enrolleeId: id! } as any);
      setDialogMsg('Next of kin information updated');
      setShowDialog(true);
      setEditNokOpen(false);
  } catch {/* TODO: add toast */}
  }

  return (
    <div className='p-6 md:p-10 space-y-8'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <div className='h-14 w-14 rounded-full bg-border overflow-hidden flex items-center justify-center text-sm font-medium'>
            { enrollee?.photoName ? <img src={enrollee.photoName} alt={fullName} className='h-full w-full object-cover' /> : fullName.slice(0,1) }
          </div>
            <h1 className='text-xl md:text-3xl font-semibold'>{ fullName || 'Enrollee Detail' }</h1>
        </div>
        { enrollee && (
          <Button variant={enrollee.isActive ? 'destructive':'primary'} onClick={handleToggle} isLoading={activate.isPending || deactivate.isPending}>
            { enrollee.isActive ? 'Deactivate Account' : 'Activate Account' }
          </Button>
        )}
      </div>

      <div className="bg-bg p-6 md:p-10 space-y-12">
        <PageTabs
            tabs={[
            { to: basePath, label: 'Personal Details' },
            { to: `${basePath}/plan`, label: 'Plan Details' },
            { to: `${basePath}/dependents`, label: 'Dependants' },
            ]}
            currentPath={currentTab === 'personal' ? basePath : currentTab === 'plan' ? `${basePath}/plan` : `${basePath}/dependents`}
        />

        <div>
            {currentTab === 'personal' && (
            <div className='space-y-8'>
                {isLoading && <p className='text-sm text-muted'>Loading...</p>}
                {isError && <p className='text-sm text-red-600'>Failed to load enrollee.</p>}
                {enrollee && (
                    <div className="space-y-8">
                        <div className='flex items-center gap-5'>
                          <h3 className='text-base font-medium'>Enrollee personal information</h3>
                          {enrollee && (
                            <Button
                              aria-label='Edit personal information'
                              size='icon'
                              variant='edit'
                              onClick={()=> setEditPersonalOpen(true)}
                              className='h-9 w-9'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm'>
                            <Detail label='ID number' value={enrollee.enrolleeIdNumber || '-'} />
                            <Detail label='Plan type' value={resolveName(enrollee.planTypeId, enrollee.planType) || '-'} />
                            <Detail label='Gender' value={enrollee.gender || '-'} />
                            <Detail label='Nationality' value={enrollee.nationality || '-'} />
                            <Detail label='Age' value={ageFromDob(enrollee.dateOfBirth)} />
                            <Detail label='State of Residence' value={enrollee.stateOfResidence || '-'} />
                            <Detail label='Phone number' value={enrollee.phoneNumber || '-'} />
                            <Detail label='LGA of Residence' value={'-'} />
                            <Detail label='HMO Class' value={resolveName(enrollee.enrolleeClassId, enrollee.enrolleeClass) || '-'} />
                            <Detail label='Ethnicity' value={enrollee.ethnicity || '-'} />
                            <Detail label='Occupation' value={enrollee.occupation || '-'} />
                            <Detail label='Full Address' value={enrollee.fullAddress || '-'} colSpan />
                        </div>
                        <div className='col-span-full pt-6 border-t border-border' />
                        <div className='flex items-center gap-5'>
                          <h3 className='text-base font-medium'>Next of kin information</h3>
                          {enrollee?.nextOfKin && (
                            <Button
                              aria-label='Edit next of kin information'
                              size='icon'
                              variant='edit'
                              onClick={()=> setEditNokOpen(true)}
                              className='h-9 w-9'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm'>
                            <Detail label='Full Name' value={enrollee.nextOfKin?.fullName || '-'} />
                            <Detail label='Relationship' value={enrollee.nextOfKin?.relationship || '-'} />
                            <Detail label='Phone number' value={enrollee.nextOfKin?.phoneNumber || '-'} />
                            <Detail label='Home Address' value={enrollee.nextOfKin?.homeAddress || '-'} colSpan />
                        </div>
                    </div>
                )}
            </div>
            )}
            {currentTab === 'plan' && (
              <div className='space-y-12'>
                {/* Top Plan Details block */}
                <div className='space-y-8'>
                  <div className='flex items-center gap-5'>
                    <h3 className='text-base font-medium'>Plan details</h3>
                    <Button size='sm' variant='primary'>Upgrade plan</Button>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12 text-sm'>
                    <Detail label='Plan type' value={resolveName(enrollee?.planTypeId, enrollee?.planType) || '-'} />
                    <Detail label='Billing Frequency' value={'Monthly'} />{/* Placeholder until field available */}
                    <Detail label='Member type' value={resolveName(enrollee?.enrolleeType?.id, enrollee?.enrolleeType) || '-'} />
                    <Detail label='Discount' value={'Nil'} />
                    <Detail label='Amount' value={enrollee?.planTypeId ? formatCurrency(4500) : '-'} />{/* Placeholder amount */}
                    <Detail label='Referral number' value={'Nil'} />
                  </div>
                  <div className='col-span-full pt-6 border-t border-border' />
                </div>

                {/* Plan Benefits Tabs */}
                <div className='space-y-6'>
                  <h3 className='text-base font-medium'>Plan benefits</h3>
                  <PlanBenefitsTabs />
                </div>
              </div>
            )}
            {currentTab === 'dependents' && (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-base font-medium'>Dependants</h3>
                  <Button size='sm' onClick={()=> setCreateDepOpen(true)}>Add Dependant</Button>
                </div>
                {depsLoading && <p className='text-xs text-muted'>Loading dependants...</p>}
                {!depsLoading && dependents.length === 0 && (
                  <p className='text-sm text-muted'>No dependants yet.</p>
                )}
                <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {dependents.map((dep: Dependent) => {
                    const name = `${dep.firstName || ''} ${dep.lastName || ''}`.trim();
                    return (
                      <div key={dep.id} className='relative group border border-border rounded-xl p-8 bg-card shadow-sm flex flex-col items-center text-center'>
                        <Button
                          aria-label='Edit dependant'
                          size='icon'
                          variant='edit'
                          className='h-8 w-8 absolute top-3 right-3'
                          onClick={()=> { setEditDep(dep); setEditDepOpen(true); }}
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                        <div className='h-24 w-24 rounded-full bg-border overflow-hidden flex items-center justify-center text-xl font-medium mb-6'>
                          {dep.photoName ? <img src={dep.photoName} alt={name} className='h-full w-full object-cover' /> : (dep.firstName || '?').slice(0,1)}
                        </div>
                        <p className='font-medium text-sm md:text-base'>{ name || 'Unnamed' }</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        <Dialog.Root open={showDialog} onOpenChange={o=> { if(!o) setShowDialog(false); }}>
            <Dialog.Content className='max-w-md'>
            <Dialog.Header>
                <Dialog.Title>Success</Dialog.Title>
                <Dialog.Description>{dialogMsg}</Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
                <Button onClick={()=> setShowDialog(false)}>Close</Button>
            </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
      </div>

      {/* Edit Personal Dialog */}
      <Dialog.Root open={editPersonalOpen} onOpenChange={o=> { if(!o) setEditPersonalOpen(false); }}>
        <Dialog.Content className='max-w-4xl'>
          <Dialog.Header>
            <Dialog.Title>Update Personal Information</Dialog.Title>
          </Dialog.Header>
          {enrollee && (
            <form onSubmit={submitPersonal} className='space-y-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Input name='FirstName' label='First Name' defaultValue={enrollee.firstName} />
                <Input name='LastName' label='Last Name' defaultValue={enrollee.lastName} />
                <Input name='OtherName' label='Other Name' defaultValue={enrollee.otherName || ''} />
                {/* Controlled select writes to hidden input for formData */}
                <input type='hidden' name='Gender' defaultValue={enrollee.gender} />
                <Select label='Gender' value={enrollee.gender} onChange={()=>{}} options={genders.map(g=> ({ value:g, label:g }))} />
                <Input name='DateOfBirth' type='date' label='Date of Birth' defaultValue={enrollee.dateOfBirth?.slice(0,10)} />
                <PhoneInputWithDialCode name='PhoneNumber' label='Phone Number' value={enrollee.phoneNumber || ''} countries={countries} onChange={()=>{}} />
                <Input name='EmailAddress' type='email' label='Email' defaultValue={enrollee.emailAddress} />
                <Input name='Occupation' label='Occupation' defaultValue={enrollee.occupation || ''} />
                <input type='hidden' name='MaritalStatus' defaultValue={enrollee.maritalStatus} />
                <Select label='Marital Status' value={enrollee.maritalStatus} onChange={()=>{}} options={maritalStatuses.map(m=> ({ value:m, label:m }))} />
                <input type='hidden' name='Nationality' defaultValue={enrollee.nationality} />
                <Select label='Nationality' value={enrollee.nationality} onChange={()=>{}} options={countries.map(c=> ({ value:c.name, label:c.name }))} />
                <Input name='Ethnicity' label='Ethnicity' defaultValue={enrollee.ethnicity || ''} />
                <Input name='FullAddress' label='Full Address' defaultValue={enrollee.fullAddress || ''} className='md:col-span-2' />
              </div>
              <div className='flex justify-end gap-3'>
                <Button type='button' variant='outline' onClick={()=> setEditPersonalOpen(false)}>Cancel</Button>
                <Button type='submit' isLoading={updateEnrolleeMut.isPending}>Submit</Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit NOK Dialog */}
      <Dialog.Root open={editNokOpen} onOpenChange={o=> { if(!o) setEditNokOpen(false); }}>
        <Dialog.Content className='max-w-4xl'>
          <Dialog.Header>
            <Dialog.Title>Update NOK Information</Dialog.Title>
          </Dialog.Header>
          {enrollee?.nextOfKin && (
            <form onSubmit={submitNok} className='space-y-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Input name='fullName' label='Full Name' defaultValue={enrollee.nextOfKin.fullName} />
                <input type='hidden' name='relationship' defaultValue={enrollee.nextOfKin.relationship} />
                <Select label='Relationship' value={enrollee.nextOfKin.relationship} onChange={()=>{}} options={relationships.map(r=> ({ value:r, label:r }))} />
                <PhoneInputWithDialCode name='phoneNumber' label='Phone Number' value={enrollee.nextOfKin.phoneNumber || ''} countries={countries} onChange={()=>{}} />
                <Input name='homeAddress' label='Home Address' defaultValue={enrollee.nextOfKin.homeAddress || ''} />
              </div>
              <div className='flex justify-end gap-3'>
                <Button type='button' variant='outline' onClick={()=> setEditNokOpen(false)}>Cancel</Button>
                <Button type='submit' isLoading={updateNokMut.isPending}>Submit</Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* Create Dependant Dialog */}
      <Dialog.Root open={createDepOpen} onOpenChange={o=> { if(!o) setCreateDepOpen(false); }}>
        <Dialog.Content className='max-w-2xl'>
          <Dialog.Header>
            <Dialog.Title>Add Dependant</Dialog.Title>
            <Dialog.Description>Create a new dependant for this enrollee.</Dialog.Description>
          </Dialog.Header>
          <form
            onSubmit={async e => {
              e.preventDefault();
              if(!id) return;
              const fd = new FormData(e.currentTarget);
              const payload: Record<string, unknown> = {
                EnrolleeId: id,
                FirstName: fd.get('FirstName') || '',
                LastName: fd.get('LastName') || '',
                Gender: fd.get('Gender') || '',
                DateOfBirth: fd.get('DateOfBirth') || '',
              };
              const photo = fd.get('Photo');
              if(photo instanceof File && photo.size > 0){
                payload.Photo = '';
              }
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await createDepMut.mutateAsync(payload as any);
                setDialogMsg('Dependant created successfully');
                setShowDialog(true);
                setCreateDepOpen(false);
              } catch {/* TODO toast */}
            }}
            className='space-y-8'
          >
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Input name='FirstName' label='First Name' required />
              <Input name='LastName' label='Last Name' required />
              <input type='hidden' name='Gender' defaultValue={genders[0] || ''} />
              <Select label='Gender' value={genders[0] || ''} onChange={()=>{}} options={genders.map(g=> ({ value:g, label:g }))} />
              <Input name='DateOfBirth' type='date' label='Date of Birth' required />
              <div className='space-y-2'>
                <label className='text-xs font-medium text-muted uppercase tracking-wide'>Photo</label>
                <input name='Photo' type='file' accept='image/*' className='text-sm' />
              </div>
            </div>
            <div className='flex justify-end gap-3'>
              <Button type='button' variant='outline' onClick={()=> setCreateDepOpen(false)}>Cancel</Button>
              <Button type='submit' isLoading={createDepMut.isPending}>Create</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Dependant Dialog */}
      <Dialog.Root open={editDepOpen} onOpenChange={o=> { if(!o){ setEditDepOpen(false); setEditDep(null); } }}>
        <Dialog.Content className='max-w-2xl'>
          <Dialog.Header>
            <Dialog.Title>Edit Dependant</Dialog.Title>
            <Dialog.Description>Update dependant information.</Dialog.Description>
          </Dialog.Header>
          {editDep && (
            <form
              onSubmit={async e => {
                e.preventDefault();
                if(!id || !editDep?.id) return;
                const fd = new FormData(e.currentTarget);
                const updated: Record<string, unknown> = {};
                fd.forEach((v,k)=> { updated[k] = v; });
                const original = {
                  FirstName: editDep.firstName,
                  LastName: editDep.lastName,
                  Gender: editDep.gender,
                  DateOfBirth: editDep.dateOfBirth?.slice(0,10),
                };
                // build dirty payload (reuse helper)
                const dirty = buildDirtyPayload(original, updated);
                const photo = fd.get('Photo');
                if(photo instanceof File && photo.size > 0){
                  dirty.Photo = photo;
                }
                if(Object.keys(dirty).length === 0){ setEditDepOpen(false); setEditDep(null); return; }
                try {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await updateDepMut.mutateAsync(dirty as any);
                  setDialogMsg('Dependant updated successfully');
                  setShowDialog(true);
                  setEditDepOpen(false);
                  setEditDep(null);
                } catch {/* TODO toast */}
              }}
              className='space-y-8'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Input name='FirstName' label='First Name' defaultValue={editDep.firstName} />
                <Input name='LastName' label='Last Name' defaultValue={editDep.lastName} />
                <input type='hidden' name='Gender' defaultValue={editDep.gender} />
                <Select label='Gender' value={editDep.gender} onChange={()=>{}} options={genders.map(g=> ({ value:g, label:g }))} />
                <Input name='DateOfBirth' type='date' label='Date of Birth' defaultValue={editDep.dateOfBirth?.slice(0,10)} />
                <div className='space-y-2 md:col-span-2'>
                  <label className='text-xs font-medium text-muted uppercase tracking-wide'>Photo</label>
                  {editDep.photoName && (
                    <div className='flex items-center gap-3'>
                      <img src={editDep.photoName} alt={editDep.firstName} className='h-12 w-12 rounded-full object-cover border border-border' />
                      <span className='text-xs text-muted'>Current</span>
                    </div>
                  )}
                  <input name='Photo' type='file' accept='image/*' className='text-sm' />
                </div>
              </div>
              <div className='flex justify-end gap-3'>
                <Button type='button' variant='outline' onClick={()=> { setEditDepOpen(false); setEditDep(null); }}>Cancel</Button>
                <Button type='submit' isLoading={updateDepMut.isPending}>Save Changes</Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Root>

    </div>
  );
}

function Detail({ label, value, colSpan }: { label: string; value?: string; colSpan?: boolean }){
  return (
    <div className={`flex text-sm md:text-base font-medium ${colSpan ? 'md:col-span-2' : ''}`}>
      <p className='flex-1 uppercase tracking-wide text-muted mb-1'>{label}</p>
      <p className='flex-1'>{value || '-'}</p>
    </div>
  );
}

function ageFromDob(dob?: string){
  if(!dob) return '-';
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age + 'yrs';
}

// Simple local tabs component for plan benefits (can be replaced with shared tabs later)
function PlanBenefitsTabs(){
  const [tab, setTab] = useState<'monthly'|'quarterly'|'yearly'>('monthly');
  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  // Placeholder benefits data (would come from API in future)
  const benefits = {
    monthly: [
      { name: 'HMO Lite', amount: 4500, description: 'Access to hospitals, Coverage for Medical Expenses up to per year, Eye care up to ₦15,000' },
      { name: 'HMO Premium', amount: 9000, description: 'Access to hospitals, Coverage for Medical Expenses up to per year, Eye care up to ₦15,000' },
    ],
    quarterly: [
      { name: 'HMO Lite (Q)', amount: 12000, description: 'Quarterly coverage package placeholder.' },
    ],
    yearly: [
      { name: 'HMO Lite (Y)', amount: 50000, description: 'Yearly coverage package placeholder.' },
    ],
  } as const;

  const data = benefits[tab];

  return (
    <div className='space-y-8'>
      <div className='flex border border-border rounded-md overflow-hidden w-full max-w-xl'>
        {tabs.map(t => (
          <button
            key={t.key}
            type='button'
            onClick={()=> setTab(t.key)}
            className={cn('flex-1 px-6 py-3 text-sm font-medium transition-colors', tab===t.key ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/50 text-muted')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className='grid gap-12 md:grid-cols-2'>
        {data.map(ben => (
          <div key={ben.name} className='space-y-4'>
            <div>
              <h4 className='font-medium'>{ben.name}</h4>
              <div className='h-px bg-border mt-2 mb-4 w-full' />
              <p className='text-primary font-medium text-sm'>{formatCurrency(ben.amount)} <span className='text-muted font-normal'>per month</span></p>
            </div>
            <p className='text-xs leading-relaxed text-muted'>{ben.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
