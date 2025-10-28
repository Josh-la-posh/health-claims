import { useState, useRef } from 'react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useCreateAuthorization } from './api';

interface Props {
  open: boolean;
  onOpenChange(open: boolean): void;
  enrolleeName?: string;
  enrolleeIdNumber?: string;
  providerId: string;
  hmoId: string;
}

// Simple dialog to submit an authorization request
export function AuthorizationRequestDialog({ open, onOpenChange, enrolleeName, enrolleeIdNumber, providerId, hmoId }: Props) {
  const mut = useCreateAuthorization();
  const [requestSource, setRequestSource] = useState('Portal');
  const [diagnosis, setDiagnosis] = useState('');
  const [requestDate, setRequestDate] = useState(''); // dd/mm/yy input display
  const [attachments, setAttachments] = useState<File[]>([]);
  const dropRef = useRef<HTMLDivElement | null>(null);

  function addFiles(list: FileList | null) {
    if(!list) return;
    const arr: File[] = [];
    for(let i=0;i<list.length;i++){ const f = list.item(i); if(f) arr.push(f); }
    setAttachments(prev => [...prev, ...arr]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
    dropRef.current?.classList.remove('ring-2','ring-primary');
  }
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dropRef.current?.classList.add('ring-2','ring-primary');
  }
  function handleDragLeave() {
    dropRef.current?.classList.remove('ring-2','ring-primary');
  }
  function removeFile(idx: number) {
    setAttachments(files => files.filter((_,i)=> i!==idx));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(!enrolleeName || !enrolleeIdNumber) return;
    if(!diagnosis) return;
    // Parse dd/mm/yy to ISO (fallback to today)
    let iso = new Date().toISOString();
    if(requestDate) {
      const parts = requestDate.split('/');
      if(parts.length===3) {
        const [dd,mm,yy] = parts;
        const fullYear = Number(yy.length===2 ? '20'+yy : yy);
        const dateObj = new Date(fullYear, Number(mm)-1, Number(dd));
        if(!isNaN(dateObj.getTime())) iso = dateObj.toISOString();
      }
    }
    mut.mutate({
      EnrolleeName: enrolleeName,
      EnrolleeIdNumber: enrolleeIdNumber,
      RequestDate: iso,
      Diagnosis: diagnosis,
      RequestSource: requestSource,
      ReferralLetter: attachments[0] || null, // first file as referral letter if needed (adjust when dedicated field available)
      ProviderId: providerId,
      HMOId: hmoId,
      Attachments: attachments,
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-xl h-[90vh] overflow-scroll">
        <Dialog.Header>
          <Dialog.Title>Authorization Request</Dialog.Title>
        </Dialog.Header>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">dd/mm/yy</span>
                <Input placeholder="dd/mm/yy" value={requestDate} onChange={e=> setRequestDate(e.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Request source</span>
                <Input value={requestSource} onChange={e=> setRequestSource(e.target.value)} />
              </label>
            </div>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Enrollee name</span>
              <Input value={enrolleeName} readOnly />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Diagnosis/request reason</span>
              <textarea value={diagnosis} onChange={(e)=> setDiagnosis(e.target.value)} required rows={3} className="w-full rounded-md border border-dashed bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter diagnosis or reason" />
            </label>
            <div ref={dropRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="rounded-md border border-dashed border-border px-4 py-6 text-sm flex flex-col gap-3 items-start"
            >
              <p className="text-muted-foreground">Drag and drop file here</p>
              <div>
                <Button type="button" variant="primary" onClick={()=> document.getElementById('authBrowseInput')?.click()}>Browse</Button>
                <input id="authBrowseInput" type="file" multiple hidden onChange={e=> addFiles(e.target.files)} />
              </div>
              {attachments.length > 0 && (
                <ul className="mt-2 w-full space-y-1">
                  {attachments.map((f,i)=> (
                    <li key={i} className="flex justify-between items-center border border-border rounded px-2 py-1 text-xs">
                      <span className="truncate max-w-[70%]" title={f.name}>{f.name}</span>
                      <button type="button" onClick={()=> removeFile(i)} className="text-red-600 hover:underline">Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex justify-start pt-2">
            <Button type="submit" disabled={mut.isPending || !diagnosis}>{mut.isPending ? 'Submitting...' : 'Submit request'}</Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default AuthorizationRequestDialog;
