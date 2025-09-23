import { useEffect, useState } from "react";
import { DataTable } from "../../../components/ui/table/DataTable";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { DropdownSelect } from "../../../components/ui/dropdown-select";
import { Drawer } from "../../../components/ui/drawer";
import { fetchTransactions } from "../api";
import { exportTransactions } from "../api"; // existing function
import type {
  Transaction,
  TransactionFilters,
  TransactionStatus
} from "../../../types/transaction";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";

const statusOptions = [
  { value: "", label: "All" },
  { value: "Success", label: "Success" },
  { value: "Failed", label: "Failed" },
  { value: "Pending", label: "Pending" },
  { value: "Reversed", label: "Reversed" }
];

const searchModeOptions = [
  { value: "transactionId", label: "Transaction ID" },
  { value: "merchantReference", label: "Merchant Ref" },
  { value: "paymentReference", label: "Payment Ref" },
  { value: "customerEmail", label: "Customer Email" }
];

// numeric backend status -> readable text
const statusMap: Record<number, string> = {
  0: "Pending",
  1: "Success",
  2: "Reversed",
  3: "Failed"
};

interface ExtendedTransaction extends Transaction {
  status?: string;
}

function renderStatus(t: ExtendedTransaction) {
  if (typeof t.transactionStatus === "number")
    return statusMap[t.transactionStatus] ?? String(t.transactionStatus);
  return t.status ?? "-";
}

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    pageNumber: 1,
    pageSize: 10
  });
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number | undefined>(0);

  const [searchMode, setSearchMode] = useState("transactionId");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false); // NEW: collapsible filter

  const [advanced, setAdvanced] = useState({
    reference: "",
    accountNumber: "",
    sessionId: "",
    customerEmail: ""
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchTransactions({
        ...filters,
        ...advanced
      });
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters,
    advanced.reference,
    advanced.accountNumber,
    advanced.sessionId,
    advanced.customerEmail
  ]);

  // Multi-format export
  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    // Reuse your existing API, but pass format param
    const blob = await exportTransactions( filters, format );
    const ext = format;
    saveAs(blob, `transactions.${ext}`);
  };

  const resetAll = () => {
    setFilters({ pageNumber: 1, pageSize: filters.pageSize });
    setSearchMode("transactionId");
    setAdvanced({
      reference: "",
      accountNumber: "",
      sessionId: "",
      customerEmail: ""
    });
  };

  const FilterCluster = (
    <div className="flex flex-wrap gap-3 items-end">
      <DropdownSelect
        options={searchModeOptions}
        value={searchMode}
        onChange={(val) => setSearchMode(val as string)}
        className="min-w-[160px]"
      />

      <Input
        placeholder={`Search by ${searchMode}`}
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            search: e.target.value,
            pageNumber: 1
          }))
        }
        className="min-w-[200px]"
      />

      <DropdownSelect
        options={statusOptions}
        value={filters.status ?? ""}
        onChange={(val) =>
          setFilters((f) => ({
            ...f,
            status: val as TransactionStatus,
            pageNumber: 1
          }))
        }
        className="min-w-[150px]"
      />

      <Input
        type="date"
        title="From"
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            fromDate: e.target.value,
            pageNumber: 1
          }))
        }
      />
      <Input
        type="date"
        title="To"
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            toDate: e.target.value,
            pageNumber: 1
          }))
        }
      />

      <div className="flex gap-2">
        <Button onClick={() => setAdvancedOpen(true)} variant="secondary">
          Advanced
        </Button>
        <Button onClick={resetAll} variant="secondary">
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Transactions{typeof total === "number" ? ` (${total})` : ""}
        </h1>
        <div className="flex gap-2 md:hidden">
          <Button variant="secondary" onClick={() => setMobileFiltersOpen(true)}>
            Filters
          </Button>
        </div>
      </div>

      {/* Collapsible Desktop Filters */}
      <div className="hidden md:block border border-border rounded-lg bg-card">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="w-full text-left px-4 py-2 font-medium border-b"
        >
          Filters {filtersOpen ? "▲" : "▼"}
        </button>
        {filtersOpen && <div className="p-4">{FilterCluster}</div>}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg bg-card p-2">
        <DataTable<Transaction, unknown>
          columns={[
            { accessorKey: "id", header: "ID" },
            { accessorKey: "merchantReference", header: "Merchant Ref" },
            { accessorKey: "paymentReference", header: "Payment Ref" },
            { accessorKey: "merchantName", header: "Merchant" },
            {
              accessorKey: "amount",
              header: "Amount",
              cell: ({ row }) => {
                const amt = row.original.amount;
                const parsed =
                  typeof amt === "string"
                    ? parseFloat(amt)
                    : typeof amt === "number"
                    ? amt
                    : null;
                return parsed !== null
                  ? parsed.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })
                  : "-";
              }
            },
            {
              accessorKey: "transactionStatus",
              header: "Status",
              cell: ({ row }) => (
                <span className="inline-block rounded px-2 py-0.5 text-xs bg-primary/10">
                  {renderStatus(row.original)}
                </span>
              )
            },
            {
              accessorKey: "createdDate",
              header: "Created",
              cell: ({ row }) =>
                row.original.createdDate
                  ? new Date(row.original.createdDate).toLocaleString()
                  : "-"
            },
            {
              id: "actions",
              header: "",
              cell: ({ row }) => (
                <Link
                  to={`/transactions/${row.original.id}`}
                  className="text-primary hover:underline"
                >
                  View
                </Link>
              )
            }
          ]}
          data={data}
          isLoading={loading}
          emptyMessage="No transactions found."
          exportOptions={[
            { label: "Download CSV", onClick: () => handleExport("csv") },
            { label: "Download Excel", onClick: () => handleExport("xlsx") },
            { label: "Download PDF", onClick: () => handleExport("pdf") }
          ]}
        />
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer.Root open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <Drawer.Content
          side="bottom"
          size="md"
          sizeMobile="lg"
          fullBleed
          className="p-5 space-y-4 md:hidden"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            <Button
              variant="secondary"
              onClick={() => setMobileFiltersOpen(false)}
              className="px-2 py-1"
            >
              Close
            </Button>
          </div>
          {FilterCluster}
        </Drawer.Content>
      </Drawer.Root>

      {/* Advanced Filters Drawer */}
      <Drawer.Root open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <Drawer.Content
          side="right"
          sideMobile="bottom"
          size="md"
          sizeMobile="lg"
          fullBleed
          className="p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold">Advanced Filters</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Payment Reference"
              value={advanced.reference}
              onChange={(e) =>
                setAdvanced((p) => ({ ...p, reference: e.target.value }))
              }
            />
            <Input
              label="Account Number"
              value={advanced.accountNumber}
              onChange={(e) =>
                setAdvanced((p) => ({ ...p, accountNumber: e.target.value }))
              }
            />
            <Input
              label="Session ID"
              value={advanced.sessionId}
              onChange={(e) =>
                setAdvanced((p) => ({ ...p, sessionId: e.target.value }))
              }
            />
            <Input
              label="Customer Email"
              value={advanced.customerEmail}
              onChange={(e) =>
                setAdvanced((p) => ({ ...p, customerEmail: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setAdvancedOpen(false);
                setFilters((f) => ({ ...f, pageNumber: 1 }));
              }}
            >
              Apply
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setAdvanced({
                  reference: "",
                  accountNumber: "",
                  sessionId: "",
                  customerEmail: ""
                });
                setAdvancedOpen(false);
              }}
            >
              Clear
            </Button>
            <Button variant="secondary" onClick={() => setAdvancedOpen(false)}>
              Cancel
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
}
