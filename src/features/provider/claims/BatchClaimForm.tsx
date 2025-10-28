import { useState } from 'react';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import Spinner from '../../../components/ui/spinner';
import { useUploadBatchClaim } from './hooks';
import type { CreateBatchClaimParams } from './types';

interface BatchClaimFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  hmoId: string;
  providerId: string;
}

export function BatchClaimForm({ open, onOpenChange, hmoId, providerId }: BatchClaimFormProps) {
  const uploadMutation = useUploadBatchClaim();
  const [claimName, setClaimName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function submit() {
    if (!file) return;
    const params: CreateBatchClaimParams = {
      hmoId,
      claimDate: new Date().toISOString(),
      claimName: claimName || `Batch-${Date.now()}`,
      providerId,
      file,
    };
    uploadMutation.mutate(params, { onSuccess: () => { onOpenChange(false); setFile(null); setClaimName(''); } });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <div className="mb-4 flex items-start justify-between">
          <Dialog.Title>Batch Claim</Dialog.Title>
        </div>
        <div className="space-y-5">
          <Input placeholder="Claim name" value={claimName} onChange={e => setClaimName(e.target.value)} />
          <div className="border border-dashed border-border rounded-lg p-4 flex flex-col gap-3 items-start bg-bg">
            <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileChange} />
            {file && <div className="text-xs text-muted-foreground">Selected: {file.name}</div>}
            <Button variant="outline" size="sm" disabled={!file} onClick={submit}>
              {uploadMutation.isPending && <Spinner className="mr-2 h-4 w-4" />} Upload
            </Button>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4 text-xs leading-relaxed space-y-2">
            <p className="font-medium">Requirements</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Files must be .CSV, .XSLX</li>
              <li>CSV file should contain the following columns - Enrollee ID, Enrollee Name, etc.</li>
              <li>The order of the columns should be same as the order in which they are listed above with the first row as headers.</li>
            </ul>
            <Button variant="ghost" size="sm" className="px-0 underline decoration-dashed">Download template Batch Claims</Button>
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} disabled={!file || uploadMutation.isPending}>
              {uploadMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}Submit Batch
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
