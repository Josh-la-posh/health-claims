import { api } from '../../../lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface TransactionRecord {
  amount: number;
  reference: string;
  narration: string;
  paymentMode: string; // EFT, etc
  transactionType: string; // Debit / Credit
  enrolleeId: string;
  corporateId: string;
  enrolleeTypeId: string;
  id: string;
  createdDate: string; // ISO
  paymentType: string; // Renewal, Plan upgrade, etc
  enrolleeName: string;
  enrolleType: string; // note spelling from API
  planType: string;
  status: string; // Successful | Failed | Pending
}

export interface TransactionsListResponse {
  data: TransactionRecord[];
  message: string;
  isSuccess: boolean;
}

export interface TransactionsQueryParams {
  ProviderId?: string;
  StartDate?: string;
  EndDate?: string;
  HmoId?: string;
  Status?: string;
  PageNumber?: number;
  PageSize?: number;
}

export function fetchTransactions(params: TransactionsQueryParams){
  return api.get<TransactionsListResponse>('/transactions', { params }).then(r => r.data);
}

export function useTransactions(params: TransactionsQueryParams){
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => fetchTransactions(params),
    placeholderData: (prev) => prev,
  });
}

export interface TransactionDetailsResponse {
  data: TransactionRecord | null;
  message: string;
  isSuccess: boolean;
}

export function fetchTransactionById(id: string){
  return api.get<TransactionDetailsResponse>(`/transactions/${id}`).then(r => r.data);
}

export function useTransaction(id?: string){
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => id ? fetchTransactionById(id) : Promise.resolve({ data: null, message: 'no id', isSuccess: false }),
    enabled: !!id,
  });
}