import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useCreateHmo } from '../api/useHmoManagement';
import { ActionResultDialog } from '../../../components/ui/action-result-dialog';

// PAGE SIZE + PAGE used only for invalidation scope; we can use 1/10 safely
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export default function HmoCreatePage(){
  const navigate = useNavigate();
  const createMut = useCreateHmo(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
  const [successOpen, setSuccessOpen] = useState(false);
  const [form, setForm] = useState({
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhoneNumber: '',
    name: '',
    code: '',
    postalAddress: '',
    addressLine1: '',
    addressLine2: ''
  });

  const baseValid = form.name.trim() && form.code.trim() && form.adminFirstName.trim() && form.adminLastName.trim() && form.adminEmail.trim();

  function handleSubmit(e: React.FormEvent){
    e.preventDefault();
    if(!baseValid || createMut.isPending) return;
    createMut.mutate({
      name: form.name.trim(),
      code: form.code.trim(),
      adminFirstName: form.adminFirstName.trim(),
      adminLastName: form.adminLastName.trim(),
      adminPhoneNumber: form.adminPhoneNumber.trim(),
      adminEmail: form.adminEmail.trim(),
      postalAddress: form.postalAddress.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
    }, {
      onSuccess: (res) => {
        if(res.isSuccess){
          setSuccessOpen(true);
          setTimeout(()=> navigate('/hmo/management/hmos'), 400); // allow dialog to render quickly
        }
      },
    });
  }

  return (
    <div className="bg-authBg min-h-screen p-6">
      <div className="bg-bg border border-border rounded-xl p-6 space-y-8 max-w-5xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl text-primary font-medium">Create New HMO</h1>
          <p className="text-sm text-muted-foreground">Fill the information below to provision a new HMO tenant.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="space-y-10">
            <h2 className="text-base md:text-xl text-primary font-medium">Admin Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Admin First Name" required value={form.adminFirstName} onChange={e=> setForm(f=> ({...f, adminFirstName: e.target.value}))} />
              <Input label="Admin Last Name" required value={form.adminLastName} onChange={e=> setForm(f=> ({...f, adminLastName: e.target.value}))} />
              <Input label="Admin Email" type="email" required value={form.adminEmail} onChange={e=> setForm(f=> ({...f, adminEmail: e.target.value}))} />
              <Input label="Admin Phone" value={form.adminPhoneNumber} onChange={e=> setForm(f=> ({...f, adminPhoneNumber: e.target.value}))} />
            </div>
          </section>
          <hr className="border-border" />
          <section className="space-y-10">
            <h2 className="text-base md:text-xl text-primary font-medium">HMO Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="HMO Name" required value={form.name} onChange={e=> setForm(f=> ({...f, name: e.target.value}))} />
              <Input label="HMO Code" required value={form.code} onChange={e=> setForm(f=> ({...f, code: e.target.value}))} />
            </div>
          </section>
          <hr className="border-border" />
          <section className="space-y-10">
            <h2 className="text-base md:text-xl text-primary font-medium">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Postal Address" value={form.postalAddress} onChange={e=> setForm(f=> ({...f, postalAddress: e.target.value}))} />
              <Input label="Address Line 1" value={form.addressLine1} onChange={e=> setForm(f=> ({...f, addressLine1: e.target.value}))} />
            </div>
            <Input label="Address Line 2" value={form.addressLine2} onChange={e=> setForm(f=> ({...f, addressLine2: e.target.value}))} />
          </section>
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button type="submit" disabled={!baseValid || createMut.isPending} isLoading={createMut.isPending}>Submit</Button>
            <Button type="button" variant="outline" disabled={createMut.isPending} onClick={()=> navigate(-1)}>Back</Button>
          </div>
        </form>
      </div>
      <ActionResultDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type="success"
        title="HMO Created"
        message="The HMO has been created successfully."
        autoCloseMs={3000}
      />
    </div>
  );
}
