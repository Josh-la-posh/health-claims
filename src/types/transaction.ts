export type TransactionStatus = "Success" | "Failed" | "Pending" | "Reversed" | string;

export interface Transaction {
  id: string;
  reference?: string;
  name?: string;
  email?: string;
  amount?: number | string;
  status?: TransactionStatus;
  date?: string;
  // Extended backend fields (optional)
  paymentReference?: string;
  merchantReference?: string;
  merchantCode?: string;
  merchantName?: string;
  narration?: string;
  transactionStatus?: number;
  processorMessage?: string;
  createdDate?: string;
  amountCollected?: string | number;
  [key: string]: unknown;
}

export interface TransactionFilters {
  pageNumber?: number;      // normalized internal
  page?: number;            // legacy support
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  status?: TransactionStatus;
  search?: string;
  // advanced / future keys
  reference?: string;
  accountNumber?: string;
  sessionId?: string;
  customerEmail?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  pageSize: number;
  pageNumber: number;
  data: T[];
  total?: number;
}