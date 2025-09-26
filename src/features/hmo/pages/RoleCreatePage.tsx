import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useNavigate } from 'react-router-dom';

export default function RoleCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // permissions placeholder
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="p-6 space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create Role</h1>
        <Button variant="outline" onClick={()=> navigate(-1)}>Back</Button>
      </div>
      <form className="space-y-6" onSubmit={(e)=> { e.preventDefault(); /* submission wiring later */ }}>
        <div className="grid md:grid-cols-2 gap-6">
          <Input label="Name" required value={name} onChange={e=> setName(e.target.value)} />
          <Input label="Description" value={description} onChange={e=> setDescription(e.target.value)} />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-primary">Permissions</h2>
          <p className="text-xs text-muted-foreground">Permission matrix placeholder – will load dynamically once role APIs are ready.</p>
          <div className="border border-dashed rounded-lg p-6 grid gap-3 text-sm text-muted-foreground">
            <p>No permissions loaded (API not wired).</p>
            <div className="flex flex-wrap gap-2">
              {selected.length === 0 && <span className="rounded bg-muted px-2 py-1 text-xs">(none selected)</span>}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={()=> { setName(''); setDescription(''); setSelected([]); }}>Reset</Button>
          <Button type="submit" disabled={!name.trim()}>Save Role</Button>
        </div>
      </form>
    </div>
  );
}
