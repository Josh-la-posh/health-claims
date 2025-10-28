import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import Spinner from '../../../components/ui/spinner';
import { useClaim } from './hooks';

interface ClaimDetailsModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  claimId?: string;
}

export function ClaimDetailsModal({ open, onOpenChange, claimId }: ClaimDetailsModalProps) {
  const { data, isLoading } = useClaim(claimId);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl">
        <div className="flex items-start justify-between mb-4">
          <Dialog.Title>Claims Details</Dialog.Title>
          <Button variant="secondary" size="sm">Export</Button>
        </div>
        {!data && isLoading && <div className="py-16 flex justify-center"><Spinner /></div>}
        {data && (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground">Claim ID</span>
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              <span className="font-mono text-xs">{data.id.slice(0,6)}</span>
              <span className="ml-3 text-xs px-2 py-1 rounded-md bg-green-100 text-green-700">{data.claimStatus}</span>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Enrollee information</h4>
              <div className="grid grid-cols-3 text-xs gap-4">
                <div>
                  <div className="text-muted-foreground mb-1">Name</div>
                  <div className="font-medium">{data.enrolleeName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Enrollee Id</div>
                  <div className="font-medium">{data.patientEnrolleeNumber}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Plan type</div>
                  <div className="font-medium">{data.planTypeName || '—'}</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Service information</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="text-left">
                      <th className="p-2 font-medium">Service name</th>
                      <th className="p-2 font-medium">Approval code</th>
                      <th className="p-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-2">{data.serviceRendered}</td>
                      <td className="p-2">{data.approvalCode || '—'}</td>
                      <td className="p-2">₦{data.amount?.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4 text-sm">Total:&nbsp;<span className="font-semibold">₦{data.amount?.toLocaleString()}</span></div>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
