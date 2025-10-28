import { useState, useMemo } from 'react';
import { useTenantSelection } from '../../../store/tenant';
import { useTariffs } from '../tariff/hooks';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import Spinner from '../../../components/ui/spinner';
import { EmptyState } from '../../../components/ui/empty-state';
import { exportToCsv } from '../../../utils/exportCsv';

export default function ProviderTariffPage() {
	const { selectedProviderId, selectedHmoId } = useTenantSelection();
	const [page, setPage] = useState(1);
	const [pageSize] = useState(20);
	const [deptFilter, setDeptFilter] = useState('');
	const [serviceFilter, setServiceFilter] = useState('');

	const query = useTariffs(selectedProviderId, selectedHmoId, page, pageSize);
	const items = query.data?.data || [];

	const filtered = useMemo(()=> {
		return items.filter(t => {
			return (!deptFilter || t.descriptions.toLowerCase().includes(deptFilter.toLowerCase())) &&
						 (!serviceFilter || t.service.toLowerCase().includes(serviceFilter.toLowerCase()));
		});
	}, [items, deptFilter, serviceFilter]);

		function handleExport() {
			if(filtered.length === 0) return;
			const headers = ['Service','Description','Code','Pricing'];
			const rows = filtered.map(f => [f.service, f.descriptions, f.code, f.price]);
			exportToCsv('tariffs.csv', headers, rows);
		}

	return (
		<div className="p-6 space-y-8">
			<div className="bg-card rounded-md border p-6 space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input placeholder="Department" value={deptFilter} onChange={e=> setDeptFilter(e.target.value)} />
					<Input placeholder="Service" value={serviceFilter} onChange={e=> setServiceFilter(e.target.value)} />
				</div>
				<Button variant="primary" onClick={()=> { setPage(1); /* filters auto-apply */ }} disabled={query.isLoading}>Apply filter</Button>
			</div>

			<div className="bg-card rounded-md border">
				<div className="flex items-center justify-between px-6 py-4">
					<h2 className="text-base font-medium">All tariffs</h2>
					<Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length===0 || query.isLoading}>Export</Button>
				</div>
				<div className="border-t">
					{query.isLoading && <div className="py-16 flex justify-center"><Spinner /></div>}
					{query.isError && <div className="p-6 text-sm text-destructive">Failed to load tariffs.</div>}
					{!query.isLoading && !query.isError && filtered.length === 0 && <EmptyState title="No tariffs" description="No tariff items match current filters." />}
					{!query.isLoading && !query.isError && filtered.length > 0 && (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-emerald-50/60">
									<tr>
										<th className="text-left px-6 py-3 font-medium">Service</th>
										<th className="text-left px-6 py-3 font-medium">Description</th>
										<th className="text-left px-6 py-3 font-medium">Code</th>
										<th className="text-left px-6 py-3 font-medium">Pricing</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map(item => (
										<tr key={item.id} className="border-t border-border">
											<td className="px-6 py-4">{item.service}</td>
											<td className="px-6 py-4">{item.descriptions}</td>
											<td className="px-6 py-4">{item.code}</td>
											<td className="px-6 py-4">₦{(item.price||0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
				{/* Simple pagination controls */}
				<div className="flex items-center justify-between px-6 py-4 border-t border-border text-xs">
					<div>Page {page}</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" disabled={page===1 || query.isLoading} onClick={()=> setPage(p=> Math.max(1,p-1))}>Prev</Button>
						<Button variant="outline" size="sm" disabled={query.isLoading || items.length < pageSize} onClick={()=> setPage(p=> p+1)}>Next</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
