import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../../../components/ui/StatCard';
import { DataTable } from '../../../../components/ui/table/DataTable';
// Filters removed per new requirements (only pagination retained)
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { cn } from '../../../../utils/cn';
import { useTransactions, type TransactionRecord } from '../../../hmo/api/transactionsApi';
import { ActionResultDialog } from '../../../../components/ui/action-result-dialog';
import { exportToCsv } from '../../../../utils/exportCsv';
import { exportToExcel } from '../../../../utils/exportFile';

interface PaymentRow {
  id: string;
  reference: string;
  amount: number;
  status: string;
  createdDate: string;
  paymentMode: string;
  paymentType: string;
  enrolleeName: string;
}

export default function PaymentHistoryPage() {
  // Filters removed: status, date range, provider & hmo context not required by backend for this list now
  const [page, setPage] = useState(0);
  const [exportSuccessOpen, setExportSuccessOpen] = useState(false);
  const [exportErrorOpen, setExportErrorOpen] = useState(false);
  const [exportErrorMsg, setExportErrorMsg] = useState('');

  const { data: txResp, isLoading, refetch } = useTransactions({
    PageNumber: page + 1,
    PageSize: 20,
  });

  const payments: TransactionRecord[] = txResp?.data || [];
  const navigate = useNavigate();

  // Derived aggregates from current page (API does not provide global counts yet)
  const total = payments.length;
  const successful = payments.filter(p => p.status?.toLowerCase() === 'successful').length;
  const failed = payments.filter(p => p.status?.toLowerCase() === 'failed').length;

  const columns: ColumnDef<PaymentRow>[] = useMemo(() => [
    { accessorKey: 'reference', header: 'Payment Ref' },
    { accessorKey: 'enrolleeName', header: 'Enrollee' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ getValue }) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(getValue<number>() || 0) },
    { accessorKey: 'paymentMode', header: 'Mode' },
    { accessorKey: 'paymentType', header: 'Type' },
    { accessorKey: 'createdDate', header: 'Date', cell: ({ getValue }) => { const v = getValue<string>(); return v ? format(new Date(v), 'dd/MM/yyyy') : '—'; } },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => { const v = (getValue<string>()||'').toLowerCase(); return <span className={cn(v==='successful' && 'text-green-600', v==='failed' && 'text-red-600', v==='pending' && 'text-amber-600')}>{v ? v.charAt(0).toUpperCase()+v.slice(1) : '—'}</span>; } },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      <button
        type="button"
        className="text-primary underline text-xs"
        onClick={() => navigate(`/hmo/reports/payments/${row.original.id}`)}
      >View</button>
    ) }
  ], [navigate]);

  const tableData: PaymentRow[] = payments.map(p => ({
    id: p.id,
    reference: p.reference,
    amount: p.amount,
    status: p.status,
    createdDate: p.createdDate,
    paymentMode: p.paymentMode,
    paymentType: p.paymentType,
    enrolleeName: p.enrolleeName,
  }));

  return (
    <>
    <div className="min-h-screen bg-authBg/60 p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Payments" value={total} color="blue" />
        <StatCard label="Successful" value={successful} color="green" />
        <StatCard label="Failed" value={failed} color="red" />
      </div>

      <div className="rounded-xl bg-white border border-border p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              placeholder="search payment ref (local only)..."
              className="w-full md:w-72 rounded-md border border-border px-3 py-2 text-sm"
              onChange={() => {/* local search could be implemented later */}}
            />
          </div>
          <button
            type="button"
            onClick={() => { refetch(); }}
            className="rounded-md border border-border bg-white px-3 py-2 text-xs hover:bg-border/40 self-start md:self-auto"
          >Refresh</button>
        </div>
        <DataTable
          columns={columns}
          data={tableData}
          isLoading={isLoading}
          pageIndex={page}
          onNextPage={() => setPage(p => p + 1)}
          onPrevPage={() => setPage(p => Math.max(0, p - 1))}
          canPrevPage={page > 0}
          canNextPage={tableData.length === 20}
          exportOptions={[
            { label: 'Export CSV', onClick: () => {
              try {
                if(!tableData.length){
                  setExportErrorMsg('There is no data to export for the selected filters.');
                  setExportErrorOpen(true);
                  return;
                }
                const headers = ['Reference','Enrollee','Amount','Mode','Type','Status','Date'];
                const rows = tableData.map(r => [r.reference, r.enrolleeName, r.amount, r.paymentMode, r.paymentType, r.status, r.createdDate]);
                exportToCsv('payments.csv', headers, rows);
                setExportSuccessOpen(true);
              } catch (e){
                console.error(e);
                setExportErrorMsg('Failed to export payments.');
                setExportErrorOpen(true);
              }
            } },
            { label: 'Export Excel', onClick: () => {
              try {
                if(!tableData.length){
                  setExportErrorMsg('There is no data to export for the selected filters.');
                  setExportErrorOpen(true);
                  return;
                }
                const headers = ['Reference','Enrollee','Amount','Mode','Type','Status','Date'];
                const rows = tableData.map(r => [r.reference, r.enrolleeName, r.amount, r.paymentMode, r.paymentType, r.status, r.createdDate]);
                exportToExcel('payments.xlsx', headers, rows);
                setExportSuccessOpen(true);
              } catch (e){
                console.error(e);
                setExportErrorMsg('Failed to export payments.');
                setExportErrorOpen(true);
              }
            } },
          ]}
        />
      </div>
    </div>
    <ActionResultDialog
      open={exportSuccessOpen}
      onOpenChange={setExportSuccessOpen}
      type="success"
      title="Export Complete"
      message="Your payment report has been exported successfully."
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
