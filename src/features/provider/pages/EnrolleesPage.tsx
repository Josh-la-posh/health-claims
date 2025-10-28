import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth';
import { useEnrollees } from '../../enrollees/hooks';
import { EmptyState, NoResultsState, Button } from '../../../components/ui';
import { Dialog } from '../../../components/ui/dialog';
import { DataTable } from '../../../components/ui/table/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import type { EnrolleeEntity } from '../../../types/enrollee';
import { Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Provider list replicates HMO EnrolleesListPage simplified (individual only, no corporate view, export omitted for now)

export default function ProviderEnrolleesPage() {
	const hmoId = useAuthStore(s => s.user?.hmoId || null);
	const navigate = useNavigate();
	const [enrolleeNumber, setEnrolleeNumber] = useState("");
	const [enrolleeName, setEnrolleeName] = useState("");
	const [pageNumber, setPageNumber] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [filterOpen, setFilterOpen] = useState(false);
	const [draftNumber, setDraftNumber] = useState("");
	const [draftName, setDraftName] = useState("");

	const params = useMemo(() => hmoId ? {
		HMOId: hmoId,
		EnrolleeNumber: enrolleeNumber || undefined,
		EnrolleeName: enrolleeName || undefined,
		PageNumber: pageNumber,
		PageSize: pageSize,
	} : undefined, [hmoId, enrolleeNumber, enrolleeName, pageNumber, pageSize]);
	const listQuery = useEnrollees(params, !!params);
	const rows = listQuery.data?.data || [];
	const isEmpty = !listQuery.isLoading && rows.length === 0 && !enrolleeName && !enrolleeNumber;
	const noResults = !listQuery.isLoading && rows.length === 0 && (!!enrolleeName || !!enrolleeNumber);

	// refetch when hmoId resolves (mirrors HMO list logic)
	useEffect(() => { if(hmoId && params) listQuery.refetch(); }, [hmoId, params, listQuery]);

	const columns = useMemo<ColumnDef<EnrolleeEntity>[]>(() => [
		{ header: 'S/N', cell: info => info.row.index + 1 },
		{ header: 'ID Number', accessorKey: 'enrolleeIdNumber' },
		{ header: 'Enrollee Name', cell: info => `${info.row.original.firstName} ${info.row.original.lastName}` },
		{ header: 'Gender', accessorKey: 'gender' },
		{ header: 'Enrollee Class', cell: info => info.row.original.enrolleeClass?.name || '-' },
		{ header: 'Plan Type', cell: info => info.row.original.planType?.name || '-' },
		{ header: 'Action', cell: info => (
			<Button variant="ghost" size="sm" className="h-auto px-0 py-0 text-xs font-medium hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/provider/enrollees/${info.row.original.id}`); }}>View</Button>
		) },
	], [navigate]);

	return (
		<div className="space-y-6 p-6">
			<div className="border border-border rounded-xl bg-card">
				<div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
					<div className="flex items-center gap-3">
						<h2 className="text-base md:text-lg font-semibold">Managed Enrollees</h2>
						<Button variant="outline" onClick={()=> { setDraftName(enrolleeName); setDraftNumber(enrolleeNumber); setFilterOpen(true); }}>Filter</Button>
					</div>
					<div className="flex items-center gap-3">
						{/* Provider may also add new enrollee if allowed; button left for parity (can be hidden via RBAC later) */}
						<Button
							onClick={() => navigate('/provider/enrollees/register')}
							variant="primary"
							leftIcon={<Plus className="h-4 w-4" />}
						>Add New Enrollee</Button>
					</div>
				</div>
				<div className="h-px w-full bg-border" />
				{listQuery.isLoading && (
					<div className="p-8 text-sm text-muted">Loading enrollees...</div>
				)}
				{listQuery.isError && (
					<div className="p-8 text-sm text-red-600">Failed to load enrollees. <Button variant="ghost" size="sm" className="h-auto px-0 py-0 underline text-red-600" onClick={()=> listQuery.refetch()}>Retry</Button></div>
				)}

				{isEmpty && (
					<EmptyState
						icon={<Users className="h-8 w-8" />}
						title="You have no enrollee yet."
						description="All managed enrollees will appear here."
						actionLabel="Add New Enrollee"
						onAction={() => navigate('/provider/enrollees/register')}
						className="px-8"
					/>
				)}
				{noResults && (
					<NoResultsState
						query={enrolleeName || enrolleeNumber}
						onReset={() => { setEnrolleeName(''); setEnrolleeNumber(''); setPageNumber(1); }}
						className="px-8"
					/>
				)}

				{!listQuery.isLoading && rows.length > 0 && (
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
							onRowClick={(row)=> navigate(`/provider/enrollees/${row.id}`)}
							pageIndex={pageNumber - 1}
							pageSize={pageSize}
							onPrevPage={()=> setPageNumber(p=> Math.max(1, p-1))}
							onNextPage={()=> setPageNumber(p=> p + 1)}
							canPrevPage={pageNumber > 1}
							canNextPage={rows.length === pageSize}
						/>
					</div>
				)}
			</div>

			{/* Filter Dialog */}
			<Dialog.Root open={filterOpen} onOpenChange={o=> setFilterOpen(o)}>
				<Dialog.Content className="max-w-md">
					<Dialog.Header>
						<Dialog.Title>Filter Enrollees</Dialog.Title>
						<Dialog.Description>Set one or more filters then apply.</Dialog.Description>
					</Dialog.Header>
					<Dialog.Body className="space-y-4">
						<div>
							<label className="mb-1 block text-xs font-medium text-muted">Enrollee Number</label>
							<input
								value={draftNumber}
								onChange={e=> setDraftNumber(e.target.value)}
								className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-4 focus:ring-ring"
								placeholder="e.g. ENR-1234"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-muted">Enrollee Name</label>
							<input
								value={draftName}
								onChange={e=> setDraftName(e.target.value)}
								className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-4 focus:ring-ring"
								placeholder="e.g. John"
							/>
						</div>
					</Dialog.Body>
					<Dialog.Footer>
						<Button variant="ghost" onClick={()=> { setDraftName(''); setDraftNumber(''); }}>Clear</Button>
						<Button variant="outline" onClick={()=> { setFilterOpen(false); }}>Cancel</Button>
						<Button onClick={()=> { setEnrolleeName(draftName); setEnrolleeNumber(draftNumber); setPageNumber(1); setFilterOpen(false); }}>Apply</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	);
}