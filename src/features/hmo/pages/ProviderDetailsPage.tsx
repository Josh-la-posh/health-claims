import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useProvider, useActivateProvider, useDeactivateProvider } from '../api/providersApi';
import { useHmoDashboardStats } from '../api/dashboardApi';
import { Button } from '../../../components/ui/button';
import { ActionResultDialog } from '../../../components/ui/action-result-dialog';
import Loader from '../../../components/ui/loader';

export default function ProviderDetailsPage(){
  const { id } = useParams();
  const { data: provider, isLoading, isError } = useProvider(id);
  const activateMut = useActivateProvider();
  const deactivateMut = useDeactivateProvider();
  const [result, setResult] = useState<{ open: boolean; type: 'success'|'error'; title: string; message: string }>({ open:false, type:'success', title:'', message:'' });
  const [basicOpen, setBasicOpen] = useState(true);
  const [contactOpen, setContactOpen] = useState(true);
  const dashboard = useHmoDashboardStats();

  const toggling = activateMut.isPending || deactivateMut.isPending;

  async function toggleActive(){
    if(!provider || !id) return;
    try {
      if(provider.isActive){
        await deactivateMut.mutateAsync(id);
        setResult({ open:true, type:'success', title:'Provider Deactivated', message:'The provider has been deactivated successfully.' });
      } else {
        await activateMut.mutateAsync(id);
        setResult({ open:true, type:'success', title:'Provider Activated', message:'The provider has been activated successfully.' });
      }
    } catch (e){
      setResult({ open:true, type:'error', title:'Action Failed', message: e instanceof Error ? e.message : 'Unable to update provider status' });
    }
  }

  return (
    <div className="min-h-screen bg-authBg p-4 md:p-6">
        {isLoading && <div className="flex items-center justify-center py-20"><Loader size={32} /></div>}
      {isError && <div className="text-center text-destructive py-10">Failed to load provider.</div>}
      {!isLoading && provider && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-border flex items-center justify-center text-xl font-semibold text-muted-foreground">{provider.hospitalName.charAt(0)}</div>
              <h1 className="text-lg md:text-xl font-semibold tracking-wide text-primary/90 leading-tight max-w-xl">{provider.hospitalName}</h1>
            </div>
            <Button variant={provider.isActive ? 'destructive':'primary'} onClick={toggleActive} disabled={toggling}>
              {toggling ? 'Processing...' : provider.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>

          {/* Grid layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column: collapsibles */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-bg border border-border rounded-xl overflow-hidden">
                <button onClick={()=> setBasicOpen(o=>!o)} className="w-full flex items-center justify-between px-5 py-4 text-sm md:text-base font-medium">
                  <span>Basic information</span>
                  <span className="text-lg text-muted-foreground">{basicOpen ? '▾':'▸'}</span>
                </button>
                {basicOpen && (
                  <div className="px-5 pb-5 pt-2 text-sm">
                    <dl className="grid grid-cols-1 gap-y-3">
                      <Info label="Eligibility status" value={provider.isActive ? 'Active':'Inactive'} highlight={provider.isActive} />
                      <Info label="Email" value={provider.email} />
                      <Info label="Address" value={provider.hospitalAdress} />
                      <Info label="Phone number" value={provider.phoneNumber} />
                      <Info label="Bank name" value={provider.bankName} />
                      <Info label="Account number" value={provider.accountNumber} />
                      <Info label="Account name" value={provider.accountName} />
                      <Info label="Account type" value={provider.accountType} />
                      <Info label="State license number" value={provider.stateLicenseNumber} />
                      <Info label="SLN expiry date" value={formatDate(provider.licenseExpiryDate)} />
                      <Info label="Professional Indemnity number" value={provider.bankVeririfationNumber} />
                      <Info label="PIN expiry date" value={formatDate(provider.licenseExpiryDate)} />
                    </dl>
                  </div>
                )}
              </div>

              <div className="bg-bg border border-border rounded-xl overflow-hidden">
                <button onClick={()=> setContactOpen(o=>!o)} className="w-full flex items-center justify-between px-5 py-4 text-sm md:text-base font-medium">
                  <span>Contact person details</span>
                  <span className="text-lg text-muted-foreground">{contactOpen ? '▾':'▸'}</span>
                </button>
                {contactOpen && (
                  <div className="px-5 pb-5 pt-2 space-y-8">
                    {provider.contacts.map((c,i)=>(
                      <div key={i} className="space-y-4">
                        <h4 className="text-xs md:text-sm font-medium tracking-wide text-muted-foreground">Contact {i+1}</h4>
                        <dl className="grid gap-y-2">
                          <Info label="Full name" value={c.name} />
                          <Info label="Email" value={c.email} />
                          <Info label="Designation" value={c.designation} />
                          <Info label="Phone number" value={c.phoneNumber} />
                        </dl>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side statistics */}
            <div className="lg:col-span-2 grid gap-6">
              <EnrolleeWidget loading={dashboard.isLoading} data={dashboard.data?.data} />
              <ClaimsWidget loading={dashboard.isLoading} data={dashboard.data?.data} />
            </div>
          </div>
        </div>
      )}

      <ActionResultDialog open={result.open} type={result.type} title={result.title} message={result.message} onOpenChange={(o)=> setResult(r=> ({ ...r, open: o }))} />
    </div>
  );
}

// --- Widgets -------------------------------------------------------------
interface DashboardData { healthProviderCount: number; expiredEnrolleePlanCount: number; newEnrolleeCount: number; sponsorCount: number; planRenewalCount: number; claimCount: number; percentageEnrollee: number; individualEnrolleeCount?: number; corporateEnrolleeCount?: number; createdDate: string; claimCountByStatus: { claimsByStatusCount: { key: string; value: number } }[]; }

function EnrolleeWidget({ loading, data }: { loading: boolean; data?: DashboardData }){
  const individual = data?.individualEnrolleeCount ?? 0;
  const corporate = data?.corporateEnrolleeCount ?? 0;
  const total = individual + corporate;
  return (
    <div className="bg-bg border border-border rounded-xl p-4 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base md:text-lg">Enrollees</h3>
        <FilterBadge />
      </div>
      {loading ? <div className="flex-1 flex items-center justify-center py-10"><Loader size={28} /></div> : (
        <div className="flex flex-col md:flex-row md:items-center gap-8 flex-1">
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-3xl font-semibold text-foreground">{total || 0}</p>
            <p className="text-muted-foreground mt-1 text-sm">Number of Enrollees</p>
          </div>
          <div className="flex-1 flex items-center justify-center gap-8 md:gap-12">
            <DonutChart size={170} segments={[{ value: individual, color: '#34D399' }, { value: corporate, color: '#1D8FE1' }]} />
            <ul className="space-y-3 text-sm">
              <Legend color="#34D399" label="Individual" />
              <Legend color="#1D8FE1" label="Corporate" />
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ClaimsWidget({ loading, data }: { loading: boolean; data?: DashboardData }){
  const total = data?.claimCount || 0;
  // Build status counts from nested array shape
  const statusMap: Record<string, number> = {};
  data?.claimCountByStatus?.forEach(s => {
    const inner = s.claimsByStatusCount; if(inner?.key) statusMap[inner.key] = inner.value || 0;
  });
  const segments = [
    { key: 'Disputed', color: '#0F766E' },
    { key: 'Pending', color: '#FBBF24' },
    { key: 'Approved', color: '#1D8FE1' },
    { key: 'Rejected', color: '#DC2626' },
  ].map(s => ({ ...s, value: statusMap[s.key] || 0 }));
  return (
    <div className="bg-bg border border-border rounded-xl p-4 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base md:text-lg">All Claims</h3>
        <FilterBadge />
      </div>
      {loading ? <div className="flex-1 flex items-center justify-center py-10"><Loader size={28} /></div> : (
        <div className="flex flex-col md:flex-row md:items-center gap-8 flex-1">
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-3xl font-semibold text-foreground">{total}</p>
            <p className="text-muted-foreground mt-1 text-sm">Number of Claims</p>
          </div>
          <div className="flex-1 flex items-center justify-center gap-8 md:gap-12">
            <DonutChart size={170} segments={segments.map(s=> ({ value: s.value, color: s.color }))} />
            <ul className="space-y-3 text-sm">
              {segments.map(s=> <Legend key={s.key} color={s.color} label={s.key} />)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function DonutChart({ size, segments }: { size: number; segments: { value: number; color: string }[] }){
  const total = segments.reduce((a,b)=> a + b.value, 0) || 1;
  let cumulative = 0;
  const circles = segments.map((s,i)=> {
    const fraction = s.value / total;
    const strokeDasharray = `${fraction*100} ${100 - fraction*100}`;
    const rotation = cumulative * 360;
    cumulative += fraction;
    return <circle key={i} r={(size/2)-8} cx={size/2} cy={size/2} fill="transparent" stroke={s.color} strokeWidth={16} strokeDasharray={strokeDasharray} transform={`rotate(${rotation} ${size/2} ${size/2})`} />;
  });
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">{circles}</svg>
      <div className="absolute inset-0 flex items-center justify-center bg-bg rounded-full" style={{ width: size*0.55, height: size*0.55, margin: 'auto' }} />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }){
  return (
    <li className="flex items-center gap-2"><span className="size-3 rounded-sm" style={{ background: color }} /> <span>{label}</span></li>
  );
}

function FilterBadge(){
  return (
    <button className="bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-md px-4 py-2 text-sm flex items-center gap-1">Monthly <span className="text-xs">▾</span></button>
  );
}

function Info({ label, value, highlight }: { label: string; value: string | number | undefined; highlight?: boolean }){
  return (
    <div className="flex text-xs font-medium">
      <dt className="flex-1 text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className={`flex-1  ${highlight ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 inline-block px-2 py-0.5 rounded':''}`}>{value ?? '-'}</dd>
    </div>
  );
}

function formatDate(iso: string){
  if(!iso) return '-';
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}
