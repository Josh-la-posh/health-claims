import { useState } from 'react';
import { useAuthStore } from '../../../store/auth';
import { EmptyState } from '../../../components/ui/empty-state';
import { Button } from '../../../components/ui/button';
import { ClaimCreateModal } from '../claims/ClaimCreateModal';
import { SingleClaimForm } from '../claims/SingleClaimForm';
import { BatchClaimForm } from '../claims/BatchClaimForm';
import { useClaims } from '../claims/hooks';
import { ClaimDetailsModal } from '../claims/ClaimDetailsModal';
import { Eye, Filter, Download } from 'lucide-react';
import { Dropdown } from '../../../components/ui/dropdown';
import { Input } from '../../../components/ui/input';
import { DataTable } from '../../../components/ui/table/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { exportToCsv } from '../../../utils/exportCsv';
import Spinner from '../../../components/ui/spinner';
import { formatDate } from '../../../utils';

// Claims columns using DataTable
const useClaimsColumns = (onSelect: (id: string) => void): ColumnDef<any, any>[] => [
  {
    id: 'enrolleeName',
    header: 'Enrollee Name',
    cell: ({ row }) => row.original.enrolleeName,
  },
  {
    id: 'serviceRendered',
    header: 'Service',
    cell: ({ row }) => row.original.serviceRendered,
  },
  {
    id: 'claimType',
    header: 'Type',
    cell: ({ row }) => row.original.claimType,
  },
  {
    id: 'amount',
    header: 'Amount',
    cell: ({ row }) => `₦${(row.original.amount || 0).toLocaleString()}`,
  },
  {
    id: 'claimStatus',
    header: 'Status',
    cell: ({ row }) => row.original.claimStatus,
  },
  {
    id: 'createdDate',
    header: 'Submitted date',
    cell: ({ row }) => formatDate(row.original.createdDate),
  },
  {
    id: 'action',
    header: 'Action',
    cell: ({ row }) => (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSelect(row.original.id); }}
        className="inline-flex items-center justify-center rounded-md h-8 w-8 hover:bg-border/40"
        aria-label="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
    ),
    size: 60,
  },
];

const CLAIM_STATUS_OPTIONS = ['New','Submitted','Disputed','Resolved','Approved','Paid'];

export default function ProviderClaimsPage() {
  const user = useAuthStore(s => s.user);
  const providerId = user?.providerId || '';
  const hmoId = user?.hmoId || '';

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [claimStatus, setClaimStatus] = useState<string>('');

  const { data = [], isLoading } = useClaims({ providerId, hmoId, startDate: startDate || undefined, endDate: endDate || undefined, claimStatus: claimStatus || undefined });
  const [chooseOpen, setChooseOpen] = useState(false);
  const [singleOpen, setSingleOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const showEmpty = !isLoading && (!data || data.length === 0);

  return (
    <div className="p-6 space-y-6">
      {isLoading && <div className="py-10 flex justify-center"><Spinner /></div>}
      {showEmpty && (
        <EmptyState
          title="No claims available yet"
          description="Start submitting claims to track and manage them here."
          actionLabel="Create new claim"
          onAction={() => setChooseOpen(true)}
          className="text-center items-center"
        />
      )}
     {!showEmpty && (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Dropdown.Root open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <Dropdown.Trigger asChild>
                        <Button variant="outline" size="sm"><div className="inline-flex items-center gap-2"><Filter className="h-4 w-4" /> Filter</div></Button>
                    </Dropdown.Trigger>
                    <Dropdown.Content sideOffset={6} className="w-72 p-3 space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Start Date</label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">End Date</label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Claim Status</label>
                            <select
                            value={claimStatus}
                            onChange={e => setClaimStatus(e.target.value)}
                            className="h-9 rounded-md border border-border bg-bg px-2 text-sm w-full"
                            >
                            <option value="">Any</option>
                            {CLAIM_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); setClaimStatus(''); }}>Reset</Button>
                            <Button size="sm" onClick={() => setFiltersOpen(false)}>Apply</Button>
                        </div>
                    </Dropdown.Content>
                </Dropdown.Root>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        if (!data.length) return;
                        exportToCsv('claims.csv', ['Enrollee','Service','Submitted date','Type','Amount','Status'], data.map(d => [d.enrolleeName, d.serviceRendered, formatDate(d.createdDate), d.claimType, d.amount, d.claimStatus]));
                    }}><div className="flex items-center gap-2"><Download className="h-4 w-4" /><span>Export</span></div></Button>
                    <Button size="sm" onClick={() => setChooseOpen(true)}>+ Create new claim</Button>
                </div>
            </div>
            <DataTable
                data={data}
                columns={useClaimsColumns((id) => { setSelectedId(id); setDetailOpen(true); })}
                isLoading={isLoading}
                emptyMessage="No claims found."
            />
        </div>
      )}

      <ClaimCreateModal
        open={chooseOpen}
        onOpenChange={setChooseOpen}
        onSelectSingle={() => setSingleOpen(true)}
        onSelectBatch={() => setBatchOpen(true)}
        onSelectGenerate={() => {/* TODO: generate via HMIS */}}
      />

      <SingleClaimForm
        open={singleOpen}
        onOpenChange={setSingleOpen}
        providerId={providerId}
        hmoId={hmoId}
      />
      <BatchClaimForm
        open={batchOpen}
        onOpenChange={setBatchOpen}
        providerId={providerId}
        hmoId={hmoId}
      />
      <ClaimDetailsModal open={detailOpen} onOpenChange={setDetailOpen} claimId={selectedId} />
    </div>
  );
}
