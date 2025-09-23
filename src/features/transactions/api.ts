// src/features/transactions/api.ts
import { api } from "../../lib/axios";
import type {
  Transaction,
  TransactionFilters,
  PaginatedResponse
} from "../../types/transaction";

export async function fetchTransactions(
  filters: TransactionFilters = {}
): Promise<PaginatedResponse<Transaction>> {
  const params = {
    pageNumber: filters.pageNumber ?? filters.page ?? 1,
    pageSize: filters.pageSize ?? 10,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    status: filters.status,
    search: filters.search,
    reference: filters.reference,
    accountNumber: filters.accountNumber,
    sessionId: filters.sessionId,
    customerEmail: filters.customerEmail
  };
  const res = await api.get<PaginatedResponse<Transaction>>("/transactions", { params });
  return res.data;
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const res = await api.get<Transaction>(`/transactions/${id}`);
  return res.data;
}

/**
 * Export transactions in the requested format.
 * 
 * @param filters Transaction filters (date, status, search, etc.)
 * @param format File format: "csv" | "xlsx" | "pdf"
 */
export async function exportTransactions(
  filters: TransactionFilters = {},
  format: "csv" | "xlsx" | "pdf" = "csv"
): Promise<Blob> {
  const params = {
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    status: filters.status,
    search: filters.search,
    format, // backend decides based on this
  };

  const res = await api.get("/transactions/export", {
    params,
    responseType: "blob",
  });

  return res.data;
}
