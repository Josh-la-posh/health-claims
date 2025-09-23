// src/pages/settings/BillingPage.tsx
import * as React from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { DataTable } from "../../../components/ui/table/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard } from "lucide-react";

type Invoice = {
  id: string;
  date: string;
  amount: string;
  status: "PAID" | "PENDING" | "FAILED";
};

const dummyInvoices: Invoice[] = [
  { id: "INV-1001", date: "2025-08-01", amount: "$49.00", status: "PAID" },
  { id: "INV-1002", date: "2025-09-01", amount: "$49.00", status: "PAID" },
  { id: "INV-1003", date: "2025-10-01", amount: "$49.00", status: "PENDING" },
];

export default function BillingPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Replace with API call
    setTimeout(() => {
      setInvoices(dummyInvoices);
      setLoading(false);
    }, 800);
  }, []);

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: "id", header: "Invoice ID" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "amount", header: "Amount" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            color={
              status === "PAID"
                ? "green"
                : status === "PENDING"
                ? "yellow"
                : "red"
            }
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="text-muted-foreground">
        Manage your subscription, invoices, and payment methods.
      </p>

      {/* Current Plan */}
      <div className="rounded-lg border p-6 shadow-sm bg-card">
        <h2 className="text-lg font-semibold">Current Plan</h2>
        <p className="text-muted-foreground">Pro Plan – $49/month</p>
        <p className="mt-1 text-sm">Renews on October 1, 2025</p>
        <div className="mt-4">
          <Button variant="primary">Upgrade / Downgrade</Button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border p-6 shadow-sm bg-card">
        <h2 className="text-lg font-semibold">Payment Method</h2>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span>Visa ending in 4242</span>
          </div>
          <Button variant="secondary" size="sm">Update</Button>
        </div>
      </div>

      {/* Invoices Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Invoices</h2>
        <DataTable
          columns={columns}
          data={invoices}
          isLoading={loading}
          isError={false}
          emptyMessage="No invoices found"
        />
      </div>
    </div>
  );
}
