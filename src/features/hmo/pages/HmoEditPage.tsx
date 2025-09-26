import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useHmo, useUpdateHmo } from '../api/useHmoManagement';
import { ActionResultDialog } from '../../../components/ui/action-result-dialog';

const DEFAULT_PAGE = 1; // for invalidation scope only
const DEFAULT_PAGE_SIZE = 10;

export default function HmoEditPage(){
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useHmo(id);
  const updateMut = useUpdateHmo(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
  const [successOpen, setSuccessOpen] = useState(false);
  const entity = data?.data;
  const [form, setForm] = useState({
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhoneNumber: '',
    name: '',
    code: '',
    postalAddress: '',
    addressLine1: '',
    addressLine2: '',
    organisationType: 'Corporate',
    isActive: true
  });

  useEffect(()=> {
    if(entity){
      setForm({
        adminFirstName: entity.adminFirstName || '',
        adminLastName: entity.adminLastName || '',
        adminEmail: entity.adminEmail || '',
        adminPhoneNumber: entity.adminPhoneNumber || '',
        name: entity.name || '',
        code: entity.code || '',
        postalAddress: entity.postalAddress || '',
        addressLine1: entity.addressLine1 || '',
        addressLine2: entity.addressLine2 || '',
        organisationType: entity.organisationType || 'Corporate',
        isActive: entity.isActive
      });
    }
  }, [entity]);

  const baseValid = form.name.trim() && form.code.trim() && form.adminFirstName.trim() && form.adminLastName.trim() && form.adminEmail.trim();

  function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    if(!id || !baseValid || updateMut.isPending) return;
    updateMut.mutate({
      id,
      name: form.name.trim(),
      code: form.code.trim(),
      adminFirstName: form.adminFirstName.trim(),
      adminLastName: form.adminLastName.trim(),
      adminPhoneNumber: form.adminPhoneNumber.trim(),
      adminEmail: form.adminEmail.trim(),
      postalAddress: form.postalAddress.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      organisationType: form.organisationType,
      isActive: form.isActive,
    }, {
      onSuccess: (res)=> {
        if(res.isSuccess){
          setSuccessOpen(true);
          setTimeout(()=> navigate('/hmo/management/hmos'), 400);
        }
      },
    });
  }

  return (
    <div className="bg-authBg min-h-screen p-6">
      <div className="bg-bg border border-border rounded-xl p-6 space-y-8 max-w-5xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl text-primary font-medium">Edit HMO</h1>
          <p className="text-sm text-muted-foreground">Update the HMO information below.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="space-y-10">
            <h2 className="text-base md:text-xl text-primary font-medium">Admin Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Admin First Name" required value={form.adminFirstName} disabled={isLoading} onChange={e=> setForm(f=> ({...f, adminFirstName: e.target.value}))} />
              <Input label="Admin Last Name" required value={form.adminLastName} disabled={isLoading} onChange={e=> setForm(f=> ({...f, adminLastName: e.target.value}))} />
              <Input label="Admin Email" type="email" required value={form.adminEmail} disabled={isLoading} onChange={e=> setForm(f=> ({...f, adminEmail: e.target.value}))} />
              <Input label="Admin Phone" value={form.adminPhoneNumber} disabled={isLoading} onChange={e=> setForm(f=> ({...f, adminPhoneNumber: e.target.value}))} />
            </div>
          </section>
          <hr className="border-border" />
          <section className="space-y-10">
            <h2 className="text-base md:text-xl text-primary font-medium">HMO Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="HMO Name" required value={form.name} disabled={isLoading} onChange={e=> setForm(f=> ({...f, name: e.target.value}))} />
              <Input label="HMO Code" required value={form.code} disabled={isLoading} onChange={e=> setForm(f=> ({...f, code: e.target.value}))} />
            </div>
          </section>
          <hr className="border-border" />
          <section className="space-y-10">
            <h2 className="text-base md:text-xl text-primary font-medium">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Postal Address" value={form.postalAddress} disabled={isLoading} onChange={e=> setForm(f=> ({...f, postalAddress: e.target.value}))} />
              <Input label="Address Line 1" value={form.addressLine1} disabled={isLoading} onChange={e=> setForm(f=> ({...f, addressLine1: e.target.value}))} />
            </div>
            <Input label="Address Line 2" value={form.addressLine2} disabled={isLoading} onChange={e=> setForm(f=> ({...f, addressLine2: e.target.value}))} />
          </section>
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button type="submit" disabled={!baseValid || updateMut.isPending} isLoading={updateMut.isPending}>Save Changes</Button>
            <Button type="button" variant="outline" disabled={updateMut.isPending} onClick={()=> navigate(-1)}>Back</Button>
          </div>
        </form>
      </div>
      <ActionResultDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type="success"
        title="HMO Updated"
        message="The HMO details have been saved successfully."
        autoCloseMs={3000}
      />
    </div>
  );
}
