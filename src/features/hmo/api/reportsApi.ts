import { api } from '../../../lib/axios';

export interface ClaimReportRow {
  providerName: string;
  hmo: string;
  enrolleeName: string;
  patientEnrolleeNumber: string;
  enrolleeEmail: string;
  enrolleePhoneNumber: string;
  reference: string;
  claimType: string; // e.g. InpatientCare
  claimStatus: string; // e.g. New | Submitted | Disputed | Resolved | Approved | Paid
  serviceRendered: string;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
  diagnosis: string;
  approvalCode: string;
  referralHospital: string;
  nhisno: string;
  serviceDate: string; // ISO
}

export interface ClaimReportResponse {
  data: ClaimReportRow[];
  message: string;
  isSuccess: boolean;
}

export interface ClaimReportQueryParams {
  ProviderId?: string | null;
  StartDate?: string;
  EndDate?: string;
  HmoId?: string | null;
  ClaimStatus?: string;
  IsExcel?: boolean; // backend hint, though we transform manually client-side for now
}

export async function fetchClaimReports(params: ClaimReportQueryParams): Promise<ClaimReportRow[]> {
  const { data } = await api.get<ClaimReportResponse>('/reports/claim-reports', { params });
  return data?.data || [];
}
