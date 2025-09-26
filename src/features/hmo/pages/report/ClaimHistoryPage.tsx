import { useState, useMemo } from 'react';
import { useAuthStore } from '../../../../store/auth';
import { useTenantSelection } from '../../../../store/tenant';
import { useHmoDashboardStats, type ClaimRecord } from '../../api/dashboardApi';
import { useClaimsList } from '../../api/useClaims';
import { StatCard } from '../../../../components/ui/StatCard';
import { DataTable } from '../../../../components/ui/table/DataTable';
import { DateRangePicker, type DateRange } from '../../../../components/ui/DateRangePicker';
import { Select } from '../../../../components/ui/select';
import { exportToExcel } from '../../../../utils/exportFile';
import { exportToCsv } from '../../../../utils/exportCsv';
import { fetchClaimReports } from '../../api/reportsApi';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { cn } from '../../../../utils/cn';
import { ClaimDetailsDrawer } from '../../components/ClaimDetailsDrawer';
import { ActionResultDialog } from '../../../../components/ui/action-result-dialog';

interface ClaimRow {
  id: string;
  patientEnrolleeNumber: string;
  enrolleeName: string;
  providerName: string;
  serviceDate: string;
  planTypeName: string;
  amount: number;
  claimStatus: string;
}

export default function ClaimHistoryPage() {
  const user = useAuthStore(s => s.user);
  const hmoId = user?.hmoId;
  const { selectedProviderId } = useTenantSelection();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const [range, setRange] = useState<DateRange>({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [exportSuccessOpen, setExportSuccessOpen] = useState(false);
  const [exportErrorOpen, setExportErrorOpen] = useState(false);
  const [exportErrorMsg, setExportErrorMsg] = useState('');

  const { data: statsResp, isLoading: statsLoading, refetch: refetchStats } = useHmoDashboardStats();
  const { data: claimsResp, isLoading: claimsLoading, refetch: refetchClaims } = useClaimsList({
    HMOId: hmoId || undefined,
    ProviderId: selectedProviderId || undefined,
    ClaimStatus: statusFilter as ClaimRecord['claimStatus'] | undefined,
    StartDate: range.start ? new Date(range.start).toISOString() : undefined,
    EndDate: range.end ? new Date(range.end).toISOString() : undefined,
    PageNumber: page + 1,
    PageSize: 20,
  });

  const stats = statsResp?.data;
  const totalClaims = stats?.claimCount ?? 0;
  const approved = stats?.claimCountByStatus?.find(c => c.claimsByStatusCount.key.toLowerCase() === 'approved')?.claimsByStatusCount.value ?? 0;
  const disputed = stats?.claimCountByStatus?.find(c => c.claimsByStatusCount.key.toLowerCase() === 'disputed')?.claimsByStatusCount.value ?? 0;

  const data: ClaimRow[] = (claimsResp?.data || []).map((c: ClaimRecord) => ({
    id: c.id,
    patientEnrolleeNumber: c.patientEnrolleeNumber,
    enrolleeName: c.enrolleeName,
    providerName: c.providerName,
    serviceDate: c.serviceDate,
    planTypeName: c.planTypeName,
    amount: c.amount,
    claimStatus: c.claimStatus,
  }));

  const columns: ColumnDef<ClaimRow>[] = useMemo(() => [
    { accessorKey: 'id', header: 'Claim ID' },
    { accessorKey: 'patientEnrolleeNumber', header: 'Enrollee ID' },
    { accessorKey: 'enrolleeName', header: 'Enrollee Name' },
    { accessorKey: 'providerName', header: 'Health Provider' },
    { accessorKey: 'serviceDate', header: 'Receive Date', cell: ({ getValue }) => {
      const v = getValue<string>();
      return v ? format(new Date(v), 'dd/MM/yyyy') : '—';
    } },
    { accessorKey: 'planTypeName', header: 'Plan Type' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ getValue }) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(getValue<number>() || 0) },
    { accessorKey: 'claimStatus', header: 'Status', cell: ({ getValue }) => {
      const val = (getValue<string>() || '').toLowerCase();
      return <span className={cn(val === 'approved' && 'text-green-600', val === 'disputed' && 'text-red-600')}>{val ? val.charAt(0).toUpperCase() + val.slice(1) : '—'}</span>;
    } },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      <button
        type="button"
        className="text-primary underline text-xs"
        onClick={() => {
          // find full claim record from original API data for richer details
          const full = (claimsResp?.data || []).find(c => c.id === row.original.id) || null;
          setSelectedClaim(full);
          setDetailsOpen(true);
        }}
      >View</button>
    ) }
  ], [claimsResp?.data]);

  async function handleExport(format: 'csv' | 'excel') {
    try {
      const params = {
        ProviderId: selectedProviderId || undefined,
        StartDate: range.start ? new Date(range.start).toISOString() : undefined,
        EndDate: range.end ? new Date(range.end).toISOString() : undefined,
        HmoId: hmoId || undefined,
        ClaimStatus: statusFilter,
        IsExcel: format === 'excel',
      };
      const rows = await fetchClaimReports(params);
      if (!rows.length) {
        setExportErrorMsg('There is no data to export for the selected filters.');
        setExportErrorOpen(true);
        return;
      }
      const headers = [
        'Provider', 'HMO', 'Enrollee Name', 'Enrollee ID', 'Enrollee Email', 'Enrollee Phone', 'Reference', 'Claim Type', 'Status', 'Service Rendered', 'Quantity', 'Price', 'Discount', 'Amount', 'Diagnosis', 'Approval Code', 'Referral Hospital', 'NHIS No', 'Service Date'
      ];
      const dataRows = rows.map(r => [
        r.providerName,
        r.hmo,
        r.enrolleeName,
        r.patientEnrolleeNumber,
        r.enrolleeEmail,
        r.enrolleePhoneNumber,
        r.reference,
        r.claimType,
        r.claimStatus,
        r.serviceRendered,
        r.quantity,
        r.price,
        r.discount,
        r.amount,
        r.diagnosis,
        r.approvalCode,
        r.referralHospital,
        r.nhisno,
        r.serviceDate ? formatDate(r.serviceDate) : ''
      ]);
      const baseName = 'claim-report';
      if (format === 'excel') {
        exportToExcel(`${baseName}.xlsx`, headers, dataRows);
      } else {
        exportToCsv(`${baseName}.csv`, headers, dataRows);
      }
      setExportSuccessOpen(true);
    } catch (err) {
      console.error('Failed to export claim reports', err);
      setExportErrorMsg('Failed to export claim reports. Please try again.');
      setExportErrorOpen(true);
    }
  }

  function formatDate(d: string) {
    try { return new Date(d).toLocaleString(); } catch { return d; }
  }

  return (
    <>
    <div className="min-h-screen bg-authBg/60 p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Claims" value={totalClaims} loading={statsLoading} color="blue" />
        <StatCard label="Approved Claims" value={approved} loading={statsLoading} color="green" />
        <StatCard label="Disputed Claims" value={disputed} loading={statsLoading} color="red" />
      </div>

      <div className="rounded-xl bg-white border border-border p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              placeholder="search claim ID or enrollee..."
              className="w-full md:w-72 rounded-md border border-border px-3 py-2 text-sm"
            />
            <DateRangePicker value={range} onChange={(r) => { setRange(r); setPage(0); }} />
          </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            {/** Radix Select disallows empty string item values; use sentinel for 'All' */}
            <Select
            options={[
                { value: '__ALL__', label: 'All Status' },
                { value: 'New', label: 'New' },
                { value: 'Submitted', label: 'Submitted' },
                { value: 'Disputed', label: 'Disputed' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Paid', label: 'Paid' },
            ]}
            value={statusFilter ?? '__ALL__'}
            onChange={(val) => {
                const v = String(val);
                setStatusFilter(v === '__ALL__' ? undefined : v);
                setPage(0);
            }}
            placeholder="Select status"
            />
          </div>
          <button
            type="button"
            onClick={() => { refetchStats(); refetchClaims(); }}
            className="rounded-md border border-border bg-white px-3 py-2 text-xs hover:bg-border/40"
          >Refresh</button>
        </div>
        </div>
        <DataTable
          columns={columns}
          data={data}
          isLoading={claimsLoading}
          pageIndex={page}
          onNextPage={() => setPage(p => p + 1)}
          onPrevPage={() => setPage(p => Math.max(0, p - 1))}
          canPrevPage={page > 0}
          canNextPage={data.length === 20}
          exportOptions={[
            { label: 'Export CSV', onClick: () => handleExport('csv') },
            { label: 'Export Excel', onClick: () => handleExport('excel') },
          ]}
        />
      </div>
    </div>
    <ClaimDetailsDrawer
      claimId={selectedClaim?.id || null}
      initialData={selectedClaim || undefined}
      open={detailsOpen}
      onOpenChange={setDetailsOpen}
    />
    <ActionResultDialog
      open={exportSuccessOpen}
      onOpenChange={setExportSuccessOpen}
      type="success"
      title="Export Complete"
      message="Your claim report has been exported successfully."
      autoCloseMs={3000}
    />
    <ActionResultDialog
      open={exportErrorOpen}
      onOpenChange={setExportErrorOpen}
      type="error"
      title="Export Unavailable"
      message={exportErrorMsg || 'Unable to export at this time.'}
      autoCloseMs={3500}
    />
    </>
  );
}
