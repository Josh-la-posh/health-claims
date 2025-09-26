import { useNavigate, useParams } from 'react-router-dom';
import { useHmo, useActivateHmo, useDeactivateHmo } from '../api/useHmoManagement';
import { useState } from 'react';
import { Dialog } from '../../../components/ui/dialog';
import { ActionResultDialog } from '../../../components/ui/action-result-dialog';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { DetailsLayout, DetailsSection, DetailsField } from '../../../components/ui/details/DetailsLayout';

const DEFAULT_PAGE = 1; // for mutation invalidation scope
const DEFAULT_PAGE_SIZE = 10;

export default function HmoDetailsPage(){
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useHmo(id);
  const activateMut = useActivateHmo(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
  const deactivateMut = useDeactivateHmo(DEFAULT_PAGE, DEFAULT_PAGE_SIZE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const entity = data?.data;

  const isPending = activateMut.isPending || deactivateMut.isPending;

  function executeToggle(){
    if(!entity) return;
    const mut = entity.isActive ? deactivateMut : activateMut;
    mut.mutate(entity.id, {
      onSuccess: (res) => {
        if(res.isSuccess){
          setSuccessOpen(true);
        }
      },
      onSettled: () => setConfirmOpen(false)
    });
  }

  return (
    <DetailsLayout
      title="HMO Details"
      action={entity && (
        <Button size="sm" variant={entity.isActive ? 'destructive' : 'primary'} disabled={isPending} onClick={()=> setConfirmOpen(true)} isLoading={isPending}>
          {entity.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      )}
    >
      {isLoading && <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>}
      {isError && <div className="text-sm text-destructive">Failed to load HMO details.</div>}
      {entity && !isLoading && !isError && (
        <div className="space-y-14">
          <DetailsSection title="Admin Information" columns={4}>
            <DetailsField label="First Name" value={entity.adminFirstName} />
            <DetailsField label="Last Name" value={entity.adminLastName} />
            <DetailsField label="Email" value={entity.adminEmail} />
            <DetailsField label="Phone Number" value={entity.adminPhoneNumber} />
          </DetailsSection>
          <DetailsSection title="HMO Information" columns={4}>
            <DetailsField label="HMO Name" value={entity.name} />
            <DetailsField label="HMO Code" value={entity.code} />
            <DetailsField label="Organisation Type" value={entity.organisationType} />
            <DetailsField label="Status" value={entity.isActive ? 'Active' : 'Inactive'} />
          </DetailsSection>
          <DetailsSection title="Address Information" columns={4}>
            <DetailsField label="Postal Code" value={entity.postalAddress} />
            <DetailsField label="Address Line 1" value={entity.addressLine1} className="md:col-span-2" />
            <DetailsField label="Address Line 2" value={entity.addressLine2} />
          </DetailsSection>
          <Button variant="outline" onClick={()=> navigate(-1)}>Back</Button>
        </div>
      )}
    
      {/* Confirm dialog */}
      <Dialog.Root open={confirmOpen} onOpenChange={(o)=> { if(!isPending) setConfirmOpen(o); }}>
        <Dialog.Content className="max-w-sm">
          <div className="px-5 pt-5 pb-6 space-y-4">
            <Dialog.Header>
              <Dialog.Title>{entity?.isActive ? 'Deactivate HMO' : 'Activate HMO'}</Dialog.Title>
              <Dialog.Description>
                {entity?.isActive ? 'Are you sure you want to deactivate this HMO? Users may lose access.' : 'Activate this HMO to enable access.'}
              </Dialog.Description>
            </Dialog.Header>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={()=> setConfirmOpen(false)} disabled={isPending}>Cancel</Button>
              <Button size="sm" variant={entity?.isActive ? 'destructive' : 'primary'} onClick={executeToggle} isLoading={isPending}>
                {entity?.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
      <ActionResultDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        type="success"
        title={activateMut.isSuccess ? 'HMO Activated' : deactivateMut.isSuccess ? 'HMO Deactivated' : 'Success'}
        message={activateMut.isSuccess ? 'The HMO has been activated.' : deactivateMut.isSuccess ? 'The HMO has been deactivated.' : 'Operation completed.'}
        autoCloseMs={3000}
      />
    </DetailsLayout>
  );
}
