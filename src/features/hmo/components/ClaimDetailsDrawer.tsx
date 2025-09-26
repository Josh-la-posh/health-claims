import { useEffect } from 'react';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { DetailsSection, DetailsField } from '../../../components/ui/details/DetailsLayout';
import { useClaimDetails } from '../api/claimDetailsApi';
import type { ClaimRecord } from '../api/dashboardApi';
import { exportToExcel } from '../../../utils/exportFile';
import { exportToCsv } from '../../../utils/exportCsv';

interface ClaimDetailsDrawerProps {
  claimId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional pre-fetched record to avoid refetch */
  initialData?: ClaimRecord;
}

export function ClaimDetailsDrawer({ claimId, open, onOpenChange, initialData }: ClaimDetailsDrawerProps){
  const { data, isLoading, isError, refetch } = useClaimDetails(claimId || undefined);

  // If we have initial data, use that preferentially
  const claim = initialData || data?.data || null;

  useEffect(() => {
    if(open && claimId && !initialData){
      refetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, claimId]);

  function handleExport(format: 'csv' | 'excel'){
    if(!claim) return;
    const headers = ['Provider','HMO','Enrollee Name','Enrollee ID','Enrollee Email','Enrollee Phone','Reference','Claim Type','Status','Service Rendered','Quantity','Price','Discount','Amount','Diagnosis','Approval Code','Referral Hospital','NHIS No','Service Date'];
    const row = [
      claim.providerName,
      claim.hmoId,
      claim.enrolleeName,
      claim.patientEnrolleeNumber,
      claim.enrolleeEmail,
      claim.enrolleePhoneNumber,
      claim.id,
      claim.claimType,
      claim.claimStatus,
      claim.serviceRendered,
      claim.quantity,
      claim.price,
      claim.discount,
      claim.amount,
      claim.diagnosis,
      claim.approvalCode,
      claim.referralHospital,
      claim.nhisno,
      new Date(claim.serviceDate).toLocaleDateString(),
    ];
    if(format === 'excel'){
      exportToExcel('claim-detail.xlsx', headers, [row]);
    } else {
      exportToCsv('claim-detail.csv', headers, [row]);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-3xl w-full">
        <div className="px-5 pt-5 pb-6 space-y-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-base font-medium flex items-center gap-3">Claim ID <span className="text-muted">• {claim?.id || '—'}</span></h2>
              {claim && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${claim.claimStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{claim.claimStatus}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExport('csv')}>Export CSV</Button>
              <Button size="sm" variant="outline" onClick={() => handleExport('excel')}>Export Excel</Button>
            </div>
          </div>

          {isLoading && <div className="text-sm text-muted">Loading claim details...</div>}
          {isError && <div className="text-sm text-destructive">Failed to load claim details.</div>}
          {claim && !isLoading && !isError && (
            <div className="space-y-12">
              <DetailsSection title="Enrollee Information" columns={3} separator>
                <DetailsField label="Name" value={claim.enrolleeName} />
                <DetailsField label="Enrollee ID" value={claim.patientEnrolleeNumber} />
                <DetailsField label="Plan Type" value={claim.planTypeName} />
              </DetailsSection>

              <DetailsSection title="Provider Information" columns={3} separator>
                <DetailsField label="Provider Name" value={claim.providerName} />
                <DetailsField label="Location" value={claim.referralHospital || '—'} />
                <DetailsField label="Service Date" value={new Date(claim.serviceDate).toLocaleDateString()} />
              </DetailsSection>

              <DetailsSection title="Service Information" columns={3} separator>
                <DetailsField label="Service Rendered" value={claim.serviceRendered} className="md:col-span-1" />
                <DetailsField label="Approval Code" value={claim.approvalCode} />
                <DetailsField label="Amount" value={new Intl.NumberFormat('en-NG',{ style:'currency', currency:'NGN'}).format(claim.amount)} />
              </DetailsSection>

              <div className="flex justify-end">
                <div className="text-sm font-medium">Total: {new Intl.NumberFormat('en-NG',{ style:'currency', currency:'NGN'}).format(claim.amount)}</div>
              </div>
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
