import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEnrollees } from "../hooks";
import { useCorporates, type Corporate } from '../../corporates/hooks';
import { useAuthStore } from "../../../store/auth";
import { EmptyState, NoResultsState, Button } from "../../../components/ui";
import { Dialog } from '../../../components/ui/dialog';
import { DataTable } from "../../../components/ui/table/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { EnrolleeEntity } from "../../../types/enrollee";
import { Users, Plus, Download } from "lucide-react";
import { api } from '../../../lib/axios';
// Wizard now lives on dedicated registration page route

export function EnrolleesListPage() {
  // HMO users fetch enrollees scoped to their own HMO id from login response.
  // In case older sessions didn't persist hmoId yet, attempt to decode from token claim (HMOId).
  const rawUserHmoId = useAuthStore(s => s.user?.hmoId || null);
  const accessToken = useAuthStore(s => s.accessToken);
  let decodedHmoId: string | null = rawUserHmoId;
  if (!decodedHmoId && accessToken) {
    try {
      const [, payload] = accessToken.split(".");
      const json = JSON.parse(atob(payload));
      if (typeof json.HMOId === "string" && json.HMOId.trim()) {
        decodedHmoId = json.HMOId;
      }
    } catch {
      // ignore decode errors
    }
  }
  const hmoId = decodedHmoId;
  const [enrolleeNumber, setEnrolleeNumber] = useState("");
  const [enrolleeName, setEnrolleeName] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const location = useLocation();
  const [view, setView] = useState<'individual'|'corporate'>(() => {
    const sp = new URLSearchParams(location.search);
    const q = sp.get('view');
    return q === 'corporate' ? 'corporate' : 'individual';
  });

  // Local draft state for dialog (apply on save)
  const [draftEnrolleeNumber, setDraftEnrolleeNumber] = useState("");
  const [draftEnrolleeName, setDraftEnrolleeName] = useState("");

  async function handleExport() {
    if (!exportStart || !exportEnd) {
      alert('Select start and end date');
      return;
    }
    try {
      setExporting(true);
      const res = await api.get('/reports/enrollees', {
        params: { startDate: exportStart, endDate: exportEnd },
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      a.download = `enrollees-${exportStart}-to-${exportEnd}-${ts}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  }

  // Debug: remove or guard behind dev flag later
  // console.debug('[EnrolleesListPage] hmoId resolved ->', hmoId);

  const params = useMemo(() => (
    hmoId ? {
      HMOId: hmoId,
      EnrolleeNumber: enrolleeNumber || undefined,
      EnrolleeName: enrolleeName || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    } : undefined
  ), [hmoId, enrolleeNumber, enrolleeName, pageNumber, pageSize]);
  const { data, isLoading, isError, error, refetch } = useEnrollees(view === 'individual' ? params : undefined, view === 'individual');
  const corporatesQuery = useCorporates();

  // Force initial fetch when hmoId becomes available (in case react-query skipped earlier)
  useEffect(() => {
    if (hmoId && params) {
      refetch();
    }
  }, [hmoId, params, refetch]);
  const rows = data?.data || [];
  const corporates = corporatesQuery.data || [];

  const columns = useMemo<ColumnDef<EnrolleeEntity>[]>(() => [
    { header: "S/N", cell: info => info.row.index + 1 },
    { header: "ID Number", accessorKey: "enrolleeIdNumber" },
    { header: "Enrollee Name", cell: info => `${info.row.original.firstName} ${info.row.original.lastName}` },
    { header: "Gender", accessorKey: "gender" },
    { header: "Enrollee Class", cell: info => info.row.original.enrolleeClass?.name || "-" },
    { header: "Plan Type", cell: info => info.row.original.planType?.name || "-" },
    { header: "Action", cell: info => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); navigate(`/hmo/enrollees/${info.row.original.id}`); }}
          className="text-primary text-xs font-medium hover:underline"
        >View</button>
      ) },
  ], [navigate]);
  const corporateColumns = useMemo<ColumnDef<Corporate>[]>(() => [
    { header: 'S/N', cell: info => info.row.index + 1 },
    { header: 'Company Name', accessorKey: 'companyName' },
    { header: 'Type', accessorKey: 'corporateType' },
    { header: 'Category', accessorKey: 'corporateCatgory' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Phone', accessorKey: 'phoneNumber' },
    { header: 'Status', cell: info => info.row.original.isActive ? 'Active' : 'Inactive' },
    { header: 'Created', cell: info => new Date(info.row.original.createdDate).toLocaleDateString() },
  ], []);

  // Derived state for empty vs no results: backend search is server-side; if we pass search param the rows already reflect search.
  const isEmpty = !isLoading && rows.length === 0 && !enrolleeName && !enrolleeNumber;
  const noResults = !isLoading && rows.length === 0 && (!!enrolleeName || !!enrolleeNumber);

  return (
    <div className="space-y-6">
      {/* View Toggle Row */}
      <div className="flex items-center gap-8 pl-1 pt-2">
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="radio" name="view" value="individual" checked={view==='individual'} onChange={()=> { setView('individual'); setPageNumber(1); }} className="accent-primary" />
          <span>Individual</span>
        </label>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="radio" name="view" value="corporate" checked={view==='corporate'} onChange={()=> { setView('corporate'); setPageNumber(1); }} className="accent-primary" />
          <span>Corporate</span>
        </label>
      </div>

      <div className="border border-border rounded-xl bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-base md:text-lg font-semibold">All Enrollees</h2>
            {view === 'individual' && <Button variant="outline" onClick={()=> { setDraftEnrolleeName(enrolleeName); setDraftEnrolleeNumber(enrolleeNumber); setFilterOpen(true); }}>Filter</Button>}
          </div>
          {view === 'individual' && (
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={()=> setExportOpen(true)}><Download className="mr-2 h-4 w-4" /> Export</Button>
              <Button
                onClick={() => navigate('/hmo/enrollees/register/individual')}
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
              >Add New Enrollee</Button>
            </div>
          )}
          {view === 'corporate' && (
            <Button
              onClick={() => navigate('/hmo/enrollees/register/corporate')}
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
            >Add Corporate</Button>
          )}
        </div>
        <div className="h-px w-full bg-border" />
        {view==='individual' && isLoading && (
          <div className="p-8 text-sm text-muted">Loading enrollees...</div>
        )}
        {view==='individual' && isError && (
          <div className="p-8 text-sm text-red-600">Error loading enrollees: {error instanceof Error ? error.message : "Unknown"} <button className="underline" onClick={() => refetch()}>Retry</button></div>
        )}
        {view==='corporate' && corporatesQuery.isLoading && (
          <div className="p-8 text-sm text-muted">Loading corporates...</div>
        )}
        {view==='corporate' && corporatesQuery.isError && (
          <div className="p-8 text-sm text-red-600">Failed to load corporates.</div>
        )}

        {view==='individual' && isEmpty && (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="You have no enrollee yet."
            description="All your registered enrollees will appear here."
            actionLabel="Add New Enrollee"
            onAction={() => navigate('/hmo/enrollees/register')}
            className="px-8"
          />
        )}

        {view==='individual' && noResults && (
          <NoResultsState
            query={enrolleeName || enrolleeNumber}
            onReset={() => { setEnrolleeName(''); setEnrolleeNumber(''); }}
            className="px-8"
          />
        )}

        {view==='individual' && !isLoading && rows.length > 0 && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-end gap-3">
              <label className="text-xs text-muted">Page Size
                <select
                  className="ml-2 h-8 rounded-md border border-input bg-card px-2 text-xs focus:outline-none focus:ring-4 focus:ring-ring"
                  value={pageSize}
                  onChange={e=> { setPageSize(Number(e.target.value)); setPageNumber(1); }}
                >
                  {[10,20,30,50].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                </select>
              </label>
            </div>
            <DataTable
              data={rows}
              columns={columns}
              onRowClick={(row)=> navigate(`/hmo/enrollees/${row.id}`)}
              pageIndex={pageNumber - 1}
              pageSize={pageSize}
              onPrevPage={()=> setPageNumber(p=> Math.max(1, p-1))}
              onNextPage={()=> setPageNumber(p=> p + 1)}
              canPrevPage={pageNumber > 1}
              canNextPage={rows.length === pageSize} // heuristic: if we received a full page we assume there might be more
            />
          </div>
        )}
        {view==='corporate' && !corporatesQuery.isLoading && corporates.length > 0 && (
          <div className="p-4">
            <DataTable data={corporates} columns={corporateColumns} />
          </div>
        )}
      </div>

      {/* Filter Dialog */}
      {view==='individual' && <Dialog.Root open={filterOpen} onOpenChange={o=> setFilterOpen(o)}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>Filter Enrollees</Dialog.Title>
            <Dialog.Description>Set one or more filters then apply.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Body className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Enrollee Number</label>
              <input
                value={draftEnrolleeNumber}
                onChange={e=> setDraftEnrolleeNumber(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-4 focus:ring-ring"
                placeholder="e.g. ENR-1234"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Enrollee Name</label>
              <input
                value={draftEnrolleeName}
                onChange={e=> setDraftEnrolleeName(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-4 focus:ring-ring"
                placeholder="e.g. John"
              />
            </div>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="ghost" onClick={()=> { setDraftEnrolleeName(''); setDraftEnrolleeNumber(''); }}>Clear</Button>
            <Button variant="outline" onClick={()=> { setFilterOpen(false); }}>Cancel</Button>
            <Button onClick={()=> { setEnrolleeName(draftEnrolleeName); setEnrolleeNumber(draftEnrolleeNumber); setPageNumber(1); setFilterOpen(false); }}>Apply</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>}

      {/* Export Dialog */}
      {view==='individual' && <Dialog.Root open={exportOpen} onOpenChange={o=> setExportOpen(o)}>
        <Dialog.Content className="max-w-md">
          <Dialog.Header>
            <Dialog.Title>Export Enrollees</Dialog.Title>
            <Dialog.Description>Select a date range to export the report.</Dialog.Description>
          </Dialog.Header>
            <Dialog.Body className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Start Date</label>
                  <input type="date" value={exportStart} onChange={e=> setExportStart(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-4 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">End Date</label>
                  <input type="date" value={exportEnd} onChange={e=> setExportEnd(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-4 focus:ring-ring" />
                </div>
              </div>
              <p className="text-xs text-muted">Data will include enrollees created within the selected date range.</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={()=> { setExportOpen(false); }}>Close</Button>
              <Button disabled={exporting || !exportStart || !exportEnd} onClick={async ()=> { await handleExport(); setExportOpen(false); }}>
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>}
    </div>
  );
}
