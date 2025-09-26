import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProviders, type ProviderRecord, fetchProviderReports } from '../api/providersApi';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../../components/ui/table/DataTable';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { NoResultsState } from '../../../components/ui/no-results-state';
import { Landmark } from 'lucide-react';
import { ActionResultDialog } from '../../../components/ui/action-result-dialog';
import { DateRangePicker, type DateRange } from '../../../components/ui/DateRangePicker';
import { exportToCsv } from '../../../utils/exportCsv';
import { exportToExcel } from '../../../utils/exportFile';

interface Row {
	id: string;
	hospitalName: string;
	phoneNumber: string;
	email: string;
	hospitalAdress: string;
	isActive: boolean;
	licenseExpiryDate: string;
}

export default function HmoProvidersPage() {
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState('');
		const [exportSuccessOpen, setExportSuccessOpen] = useState(false);
		const [exportErrorOpen, setExportErrorOpen] = useState(false);
		const [exportErrorMsg, setExportErrorMsg] = useState('');
		const [range, setRange] = useState<DateRange>({});
	const navigate = useNavigate();

	const { data: providersResp, isLoading, refetch } = useProviders({ PageNumber: page + 1, PageSize: 20 });
		const providers = useMemo(() => providersResp?.data || [], [providersResp?.data]);

	const filtered = useMemo(() => {
		if(!search.trim()) return providers;
		const q = search.toLowerCase();
		return providers.filter(p => p.hospitalName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
	}, [providers, search]);

	const empty = providers.length === 0 && !isLoading;
	const noResults = providers.length > 0 && filtered.length === 0 && !isLoading;

	const columns: ColumnDef<Row>[] = useMemo(() => [
		{ header: 'S/N', accessorKey: 'serial', cell: ({ row }) => (page * 20) + row.index + 1 },
		{ header: 'Provider ID', accessorKey: 'id' },
		{ header: 'Provider Name', accessorKey: 'hospitalName' },
		{ header: 'Location', accessorKey: 'hospitalAdress' },
		{ header: 'Eligibility Status', accessorKey: 'isActive', cell: ({ getValue }) => getValue<boolean>() ? 'Active' : 'Inactive' },
		{ header: 'Expiry Date', accessorKey: 'licenseExpiryDate', cell: ({ getValue }) => {
			const v = getValue<string>();
			if(!v) return '—';
			try { return new Date(v).toLocaleDateString(); } catch { return v; }
		} },
		{ id: 'actions', header: 'Action', cell: ({ row }) => (
			<button
				type="button"
				className="text-primary text-xs underline"
				onClick={() => navigate(`/hmo/providers/${row.original.id}`)}
			>View</button>
		) }
	], [navigate, page]);

	const tableData: Row[] = filtered.map((p: ProviderRecord) => ({
		id: p.id,
		hospitalName: p.hospitalName,
		phoneNumber: p.phoneNumber,
		email: p.email,
		hospitalAdress: p.hospitalAdress,
		isActive: p.isActive,
		licenseExpiryDate: p.licenseExpiryDate,
	}));

		async function handleExport(kind: 'csv' | 'excel') {
			try {
				const rows = await fetchProviderReports({
					startDate: range.start ? new Date(range.start).toISOString() : undefined,
					endDate: range.end ? new Date(range.end).toISOString() : undefined,
				});
				if(!rows.length){
					setExportErrorMsg('There is no data to export for the selected date range.');
					setExportErrorOpen(true);
					return;
				}
				const headers = ['Provider Name','Address','Phone','Email','Status','License Expiry','Created'];
				const dataRows = rows.map(r => [
					r.hospitalName,
					r.hospitalAdress,
					r.phoneNumber,
					r.email,
					r.isActive ? 'Active':'Inactive',
					r.licenseExpiryDate,
					r.createdDate,
				]);
				if(kind === 'excel') exportToExcel('providers-report.xlsx', headers, dataRows); else exportToCsv('providers-report.csv', headers, dataRows);
				setExportSuccessOpen(true);
			} catch (e) {
				console.error(e);
				setExportErrorMsg('Failed to export providers report.');
				setExportErrorOpen(true);
			}
		}

	return (
		<div className="p-6 space-y-6">
			<div className="rounded-xl bg-white border border-border p-4 space-y-4">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<h1 className="text-base font-medium">All Providers</h1>
					<div className="flex items-center gap-3">
						<Button variant="outline" size="sm" onClick={() => handleExport('excel')}>Export</Button>
						<Button size="sm" onClick={() => navigate('/hmo/providers/register')}>Add New Provider</Button>
					</div>
				</div>
						<div className="flex flex-col md:flex-row md:items-center gap-3">
					<input
						value={search}
						onChange={e => { setSearch(e.target.value); setPage(0); }}
						placeholder="Search provider name or email..."
						className="w-full md:w-80 rounded-md border border-border px-3 py-2 text-sm"
					/>
							<DateRangePicker value={range} onChange={(r) => setRange(r)} />
					<Button variant="outline" size="sm" onClick={() => refetch()}>Refresh</Button>
				</div>

                {empty && (
                    <EmptyState
                        icon={<Landmark className="h-8 w-8" />}
                        title="You have no provider yet"
                        description="All your registered providers appears here."
                        actionLabel="Add New Provider"
                        onAction={() => navigate('/hmo/providers/register')}
                        className="px-8"
                    />
                )}
                {noResults && (
                    <NoResultsState
                        query={search}
                        onReset={() => setSearch('')}
                        className="px-8"
                    />
                )}
				{!empty && !noResults && (
					<DataTable
						columns={columns}
						data={tableData}
						isLoading={isLoading}
						pageIndex={page}
						onNextPage={() => setPage(p => p + 1)}
						onPrevPage={() => setPage(p => Math.max(0, p - 1))}
						canPrevPage={page > 0}
						canNextPage={providers.length === 20}
					/>
				)}
			</div>
			<ActionResultDialog
				open={exportSuccessOpen}
				onOpenChange={setExportSuccessOpen}
				type="success"
				title="Export Complete"
				message="Providers exported successfully."
				autoCloseMs={2500}
			/>
			<ActionResultDialog
				open={exportErrorOpen}
				onOpenChange={setExportErrorOpen}
				type="error"
				title="Export Unavailable"
				message={exportErrorMsg || 'Unable to export at this time.'}
				autoCloseMs={3000}
			/>
		</div>
	);
}
