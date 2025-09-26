import { useParams, useNavigate } from 'react-router-dom';
import { DetailsLayout, DetailsSection, DetailsField } from '../../../../components/ui/details/DetailsLayout';
import { useTransaction } from '../../../hmo/api/transactionsApi';
import { Button } from '../../../../components/ui/button';
import { exportToCsv } from '../../../../utils/exportCsv';
import { exportToExcel } from '../../../../utils/exportFile';
import { useMemo } from 'react';

export default function PaymentDetailsPage(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useTransaction(id);
  const record = data?.data || null;

  const exportRows = useMemo(() => record ? [[
    record.reference,
    record.enrolleeName,
    record.amount,
    record.paymentMode,
    record.paymentType,
    record.status,
    record.createdDate,
  ]] : [], [record]);

  function doExport(kind: 'csv'|'excel'){
    if(!record) return;
    const headers = ['Reference','Enrollee','Amount','Mode','Type','Status','Date'];
    const name = `payment-${record.id}.${kind === 'excel' ? 'xlsx' : 'csv'}`;
    if(kind === 'excel') exportToExcel(name, headers, exportRows); else exportToCsv(name, headers, exportRows);
  }

  return (
    <DetailsLayout
      title={record ? `Payment ${record.reference}` : 'Payment Details'}
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="outline" size="sm" onClick={() => doExport('csv')} disabled={!record}>Export CSV</Button>
          <Button variant="outline" size="sm" onClick={() => doExport('excel')} disabled={!record}>Export Excel</Button>
        </div>
      }
    >
      {isLoading && <div className="text-sm">Loading payment details...</div>}
      {!isLoading && !record && <div className="text-sm text-red-600">Payment not found.</div>}
      {record && (
        <div className="space-y-10">
          <DetailsSection title="Payment Information" columns={4}>
            <DetailsField label="Reference" value={record.reference} />
            <DetailsField label="Status" value={record.status} />
            <DetailsField label="Mode" value={record.paymentMode} />
            <DetailsField label="Type" value={record.paymentType} />
            <DetailsField label="Amount" value={new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(record.amount)} />
            <DetailsField label="Created Date" value={record.createdDate ? new Date(record.createdDate).toLocaleString() : '—'} />
          </DetailsSection>
          <DetailsSection title="Enrollee" columns={4}>
            <DetailsField label="Enrollee Name" value={record.enrolleeName} />
            <DetailsField label="Enrollee ID" value={record.enrolleeId} />
            <DetailsField label="Plan Type" value={record.planType} />
            <DetailsField label="Enrollee Type" value={record.enrolleType} />
          </DetailsSection>
          <DetailsSection title="Additional" columns={4}>
            <DetailsField label="Narration" value={record.narration} />
            <DetailsField label="Corporate ID" value={record.corporateId} />
            <DetailsField label="Enrollee Type ID" value={record.enrolleeTypeId} />
            <DetailsField label="Transaction Type" value={record.transactionType} />
          </DetailsSection>
        </div>
      )}
    </DetailsLayout>
  );
}