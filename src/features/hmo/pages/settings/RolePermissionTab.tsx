import { useState, useMemo } from 'react';
import { useRoles } from '../../../settings/useRoles';
import { useRolePermissions, useUpdateRolePermissions } from '../../../settings/useRolePermissions';
import type { RolePermissionClaim } from '../../../settings/rolePermissionsApi';
import { Button } from '../../../../components/ui/button';
import { SkeletonLine } from '../../../../components/ui/skeleton';
import { ActionResultDialog } from '../../../../components/ui/action-result-dialog';

type DomainRow = {
  domain: string;
  pretty: string;
  claims: Record<string, RolePermissionClaim | undefined>; // action -> claim
};

const ACTIONS = ['Add','Update','Delete','View','Activate','Deactivate'] as const;

function humanizeDomain(domain: string){
  return domain
    .replace(/([a-z])([A-Z])/g,'$1 $2')
    .replace(/Enrollee/g,' Enrollee')
    .trim();
}

export default function RolePermissionTab(){
  const { data: roles, isLoading: rolesLoading, isError: rolesError } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(undefined);
  const { data: claims, isLoading: permsLoading, isError: permsError } = useRolePermissions(selectedRoleId);
  const updateMut = useUpdateRolePermissions(selectedRoleId);

  // Build grouped structure
  const grouped = useMemo<DomainRow[]>(() => {
    if(!claims) return [];
    const map = new Map<string, DomainRow>();
    claims.forEach(c => {
      const parts = c.value.split('.');
      if(parts.length < 3) return; // unexpected format
      const domain = parts[1];
      const action = parts[2];
      if(!map.has(domain)){
        map.set(domain, { domain, pretty: humanizeDomain(domain), claims: {} });
      }
      const row = map.get(domain)!;
      row.claims[action] = c;
    });
    return Array.from(map.values()).sort((a,b)=> a.pretty.localeCompare(b.pretty));
  }, [claims]);

  const [result, setResult] = useState<{ open: boolean; type: 'success' | 'error'; title: string; message: string }>({ open: false, type: 'success', title: '', message: '' });

  function openSuccess(title: string, message: string){
    setResult({ open: true, type: 'success', title, message });
  }

  function toggle(domain: string, action: string){
    if(!claims) return;
    const claim = claims.find(c => c.value === `Permissions.${domain}.${action}`);
    if(!claim) return; // missing claim
    const next = claims.map(c => c === claim ? { ...c, selected: !c.selected } : c);
    updateMut.mutate(next as RolePermissionClaim[], { onSuccess: ()=> openSuccess('Permission Updated', `${humanizeDomain(domain)} - ${action} ${claim.selected ? 'removed' : 'granted'}.`) });
  }

  function toggleDomain(domain: string){
    if(!claims) return;
    const domainClaims = claims.filter(c => c.value.startsWith(`Permissions.${domain}.`));
    const allSelected = domainClaims.length>0 && domainClaims.every(c=> c.selected);
    const next = claims.map(c => c.value.startsWith(`Permissions.${domain}.`) ? { ...c, selected: !allSelected } : c);
    updateMut.mutate(next as RolePermissionClaim[], { onSuccess: ()=> openSuccess('Domain Updated', `${humanizeDomain(domain)} permissions ${allSelected ? 'cleared' : 'granted'}.`) });
  }

  function toggleAll(){
    if(!claims) return;
    const all = claims.every(c=> c.selected);
    const next = claims.map(c => ({ ...c, selected: !all }));
    updateMut.mutate(next as RolePermissionClaim[], { onSuccess: ()=> openSuccess('Permissions Updated', all ? 'All permissions unselected.' : 'All permissions selected.') });
  }

  function saveAll(){
    if(!claims) return;
    updateMut.mutate(claims as RolePermissionClaim[], { onSuccess: ()=> openSuccess('Permissions Saved', 'Role permissions updated successfully.') });
  }

  const globalAll = claims?.length ? claims.every(c=> c.selected) : false;
  const globalSome = claims?.some(c=> c.selected) && !globalAll;

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4 flex-wrap">
        <div className="space-y-1">
          <label className="block text-xs font-medium">Select Role</label>
          <select
            className="h-10 px-3 rounded-md border border-border bg-card text-sm"
            value={selectedRoleId || ''}
            onChange={(e)=> setSelectedRoleId(e.target.value || undefined)}
            disabled={rolesLoading || rolesError}
          >
            <option value="">-- Choose --</option>
            {roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="ml-auto flex gap-2 items-center">
          <Button variant="outline" size="sm" disabled={!selectedRoleId || !claims?.length || updateMut.isPending} onClick={toggleAll}>
            {globalAll ? 'Unselect All' : globalSome ? 'Select Remaining' : 'Select All'}
          </Button>
          <Button disabled={!selectedRoleId || !claims?.length || updateMut.isPending} isLoading={updateMut.isPending} onClick={saveAll}>Save Changes</Button>
        </div>
      </div>

      {!selectedRoleId && (
        <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center">Choose a role to load its permissions.</div>
      )}

      {selectedRoleId && (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-border/40 text-muted">
              <tr>
                <th className="text-left px-4 py-2 font-medium w-56">Domain</th>
                {ACTIONS.map(a => (
                  <th key={a} className="text-center px-4 py-2 font-medium">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permsLoading && [...Array(4)].map((_,i)=>(
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2"><SkeletonLine /></td>
                  {ACTIONS.map(a=> <td key={a} className="px-4 py-2 text-center"><SkeletonLine /></td>)}
                </tr>
              ))}
              {permsError && (
                <tr><td colSpan={1 + ACTIONS.length} className="px-4 py-6 text-center text-red-600">Failed to load permissions.</td></tr>
              )}
              {!permsLoading && !permsError && grouped.length === 0 && (
                <tr><td colSpan={1 + ACTIONS.length} className="px-4 py-10 text-center text-muted-foreground text-sm">No permissions.</td></tr>
              )}
              {grouped.map(row => {
                const domainSelectedAll = ACTIONS.every(a => row.claims[a]?.selected || !row.claims[a]);
                const domainSome = ACTIONS.some(a => row.claims[a]?.selected) && !domainSelectedAll;
                return (
                  <tr key={row.domain} className="border-t border-border hover:bg-border/20">
                    <td className="px-4 py-2 font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={()=> toggleDomain(row.domain)}
                          className="text-left hover:underline"
                        >
                          {row.pretty}
                        </button>
                        <span className="text-[10px] uppercase tracking-wide rounded bg-border/60 px-1 py-0.5 text-muted-foreground">
                          {domainSelectedAll ? 'All' : domainSome ? 'Mixed' : 'None'}
                        </span>
                      </div>
                    </td>
                    {ACTIONS.map(action => {
                      const claim = row.claims[action];
                      if(!claim){
                        return <td key={action} className="px-4 py-2 text-center text-muted-foreground">—</td>;
                      }
                      return (
                        <td key={action} className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={claim.selected}
                            onChange={()=> toggle(row.domain, action)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Click a domain name to toggle all of its actions. Use Save Changes to persist updates.</p>
        <p className="italic">Future: search, collapse domains, custom action categories, diff vs base role.</p>
      </div>
      <ActionResultDialog open={result.open} type={result.type} title={result.title} message={result.message} onOpenChange={(o)=> setResult(r=> ({ ...r, open: o }))} />
    </div>
  );
}
