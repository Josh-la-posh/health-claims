import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';

interface ClaimCreateModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectSingle: () => void;
  onSelectBatch: () => void;
  onSelectGenerate: () => void;
}

export function ClaimCreateModal({ open, onOpenChange, onSelectSingle, onSelectBatch, onSelectGenerate }: ClaimCreateModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <div className="flex items-start justify-between mb-4">
          <Dialog.Title>How would you like to submit your claims?</Dialog.Title>
          <Dialog.Close className="text-muted-foreground hover:text-fg">✕</Dialog.Close>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-center" onClick={() => { onSelectSingle(); onOpenChange(false); }}>Single claim</Button>
          <Button variant="outline" className="w-full justify-center" onClick={() => { onSelectBatch(); onOpenChange(false); }}>Batch upload</Button>
          <Button variant="outline" className="w-full justify-center" onClick={() => { onSelectGenerate(); onOpenChange(false); }}>Generate from HMIS</Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
