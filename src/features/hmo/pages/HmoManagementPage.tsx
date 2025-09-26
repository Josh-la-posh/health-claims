import { useState, useMemo } from 'react';
import { DataTable } from '../../../components/ui/table/DataTable';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../../components/ui/button';
import { useHmos, type HmoEntity } from '../api/useHmoManagement';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

export default function HmoManagementPage(){
  const navigate = useNavigate();
  const [page, setPage] = useState(1); // API PageNumber is 1-based
  const { data, isLoading, isError } = useHmos(page, PAGE_SIZE);
  const rows = data?.data || [];
  const canNext = rows.length === PAGE_SIZE; // heuristic until backend returns total
  const canPrev = page > 1;

  const columns = useMemo<ColumnDef<HmoEntity>[]>(() => [
    { header: 'HMO Name', accessorKey: 'name' },
    { header: 'HMO Code', accessorKey: 'code' },
    { header: 'Admin Name', cell: ({ row }) => `${row.original.adminFirstName} ${row.original.adminLastName}` },
    { header: 'Admin Email', accessorKey: 'adminEmail' },
    { header: 'Admin Phone', accessorKey: 'adminPhoneNumber' },
    { header: 'Status', cell: ({ row }) => row.original.isActive ? 'Active' : 'Inactive' },
    { header: 'Created Date', cell: ({ row }) => new Date(row.original.createdDate).toLocaleDateString() },
    { header: 'Action', id: 'action', cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={()=> navigate(`/hmo/management/hmos/${row.original.id}`)}>View</Button>
        <Button size="sm" variant="outline" onClick={()=> navigate(`/hmo/management/hmos/${row.original.id}/edit`)}>Edit</Button>
      </div>
    ) }
  ], [navigate]);

  return (
    <div className="bg-authBg min-h-screen p-6">{/* outer themed background */}
      <div className="bg-bg border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-medium">All HMO's</h1>
            <Button size="sm" onClick={()=> navigate('/hmo/management/hmos/new')}>Create New HMO</Button>
        </div>
        <DataTable
          data={rows}
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          emptyMessage="No HMOs found."
          pageIndex={page-1}
          pageSize={PAGE_SIZE}
          onNextPage={()=> canNext && setPage(p=> p+1)}
          onPrevPage={()=> canPrev && setPage(p=> Math.max(1, p-1))}
          canNextPage={canNext}
          canPrevPage={canPrev}
        />
      </div>

      {/* Dialog removed in favor of dedicated create/edit pages */}
    </div>
  );
}