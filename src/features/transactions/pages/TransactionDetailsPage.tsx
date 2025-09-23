// src/features/transactions/pages/TransactionDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchTransaction } from "../api";
import { Button } from "../../../components/ui/button";
import { saveAs } from "file-saver";
import type { Transaction } from "../../../types/transaction";

export default function TransactionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [txn, setTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    if (id) fetchTransaction(id).then(setTxn);
  }, [id]);

  if (!txn) return <p className="p-6">Loading...</p>;

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(txn, null, 2)], { type: "application/json" });
    saveAs(blob, `transaction-${txn.id}.json`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border border-border rounded-lg bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Transaction Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong>ID:</strong> {txn.id}</p>
          <p><strong>Reference:</strong> {txn.reference}</p>
          <p><strong>Name:</strong> {txn.name}</p>
          <p><strong>Email:</strong> {txn.email}</p>
          <p><strong>Amount:</strong> ₦{txn.amount !== undefined ? txn.amount.toLocaleString() : "N/A"}</p>
          <p><strong>Status:</strong> {txn.status}</p>
          <p><strong>Date:</strong> {txn.date}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownload}>Download Transaction</Button>
          <Link to="/transactions">
            <Button variant="secondary">Back to Transactions</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
