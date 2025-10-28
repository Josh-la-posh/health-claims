import { useState } from 'react';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { CLAIM_SERVICE_OPTIONS, type CreateSingleClaimRequest, type ClaimItemInput } from './types';
import { useCreateSingleClaim } from './hooks';
import Spinner from '../../../components/ui/spinner';

interface SingleClaimFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  providerId: string;
  hmoId: string;
}

export function SingleClaimForm({ open, onOpenChange, providerId, hmoId }: SingleClaimFormProps) {
  const createMutation = useCreateSingleClaim();
  const [claimItems, setClaimItems] = useState<ClaimItemInput[]>([]);
  const claimDisplayId = '00034'; // placeholder until backend supplies real ID

  function addItem() {
    setClaimItems(prev => [...prev, {
      serviceRendered: '', enrolleeName: '', patientEnrolleeNumber: '', providerId, hmoId,
      enrolleeEmail: '', enrolleePhoneNumber: '', claimType: 'InpatientCare', quantity: 1, price: 0, discount: 0, amount: 0,
      diagnosis: '', approvalCode: '', referralHospital: '', nhisno: '', serviceDate: new Date().toISOString(), attachments: []
    }]);
  }

  function updateItem(idx: number, patch: Partial<ClaimItemInput>) {
    setClaimItems(items => items.map((it, i) => i === idx ? { ...it, ...patch, amount: (patch.price ?? it.price) * (patch.quantity ?? it.quantity) } : it));
  }

  function submit() {
    const body: CreateSingleClaimRequest = {
      claimItems: claimItems.map(i => ({ ...i, amount: i.price * i.quantity })),
      hmoId,
      claimDate: new Date().toISOString(),
      claimName: `Claim-${Date.now()}`,
      providerId
    };
    createMutation.mutate(body, { onSuccess: () => { onOpenChange(false); setClaimItems([]); } });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-3xl">
        <div className="mb-4">
          <Dialog.Title className="text-xl">New Claim</Dialog.Title>
        </div>
        {/* Claim ID */}
        <div className="flex items-center gap-2 text-sm font-medium mb-6">
          <span className="text-muted-foreground">Claim ID</span>
          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          <span className="font-mono text-xs">{claimDisplayId}</span>
        </div>
        {/* Top enrollee / meta fields - design shows 4 inputs (name/id/phone/date) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Input placeholder="Enrollee name" />
          <Input placeholder="Enrollee Id" />
          <Input placeholder="Phone number" />
          <Input type="date" placeholder="Date" />
        </div>
        {/* Service information */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium">Service information</h4>
          {/* Dropdown for selecting service type before adding rows */}
          <div>
            <select
              className="h-9 w-44 rounded-md border border-border bg-bg px-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>service type</option>
              {CLAIM_SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
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
                {claimItems.map((item, idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="p-2">
                      <Input placeholder="Service name" value={item.serviceRendered} onChange={e => updateItem(idx, { serviceRendered: e.target.value })} />
                    </td>
                    <td className="p-2">
                      <Input placeholder="Approval code" value={item.approvalCode} onChange={e => updateItem(idx, { approvalCode: e.target.value })} />
                    </td>
                    <td className="p-2 align-middle">₦{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
                {claimItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-xs text-muted-foreground bg-muted/10">No service items yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={addItem} className="justify-start">+ Add item</Button>
        </div>
        {/* Bottom submit */}
        <div className="mt-8">
          <Button className="w-48" onClick={submit} disabled={createMutation.isPending}>{createMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}Submit Claims</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
