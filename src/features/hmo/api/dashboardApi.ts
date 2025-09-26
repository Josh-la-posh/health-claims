import { api } from '../../../lib/axios';
import { useQuery } from '@tanstack/react-query';

export interface HmoDashboardStatsResponse {
  data: {
    healthProviderCount: number;
    expiredEnrolleePlanCount: number;
    newEnrolleeCount: number;
    sponsorCount: number;
    planRenewalCount: number;
    claimCount: number;
    percentageEnrollee: number;
  individualEnrolleeCount?: number;
  corporateEnrolleeCount?: number;
    createdDate: string;
    claimCountByStatus: { claimsByStatusCount: { key: string; value: number } }[];
  };
  message: string;
  isSuccess: boolean;
}

export function fetchHmoDashboardStats() {
  return api.get<HmoDashboardStatsResponse>('/dashboards/hmo-dashboard').then(r => r.data);
}

export function useHmoDashboardStats() {
  return useQuery({
    queryKey: ['hmo-dashboard-stats'],
    queryFn: fetchHmoDashboardStats,
    staleTime: 5 * 60 * 1000,
  });
}

export interface ClaimRecord {
  id: string;
  isActive: boolean;
  serviceRendered: string;
  enrolleeName: string;
  patientEnrolleeNumber: string;
  providerId: string;
  hmoId: string;
  enrolleeEmail: string;
  enrolleePhoneNumber: string;
  claimType: string;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
  diagnosis: string;
  approvalCode: string;
  referralHospital: string;
  nhisno: string;
  serviceDate: string;
  attachments: unknown[];
  createdDate: string;
  claimStatus: 'New' | 'Submitted' | 'Disputed' | 'Resolved' | 'Approved' | 'Paid';
  planTypeName: string;
  planTypeId: string;
  providerName: string;
}

export interface ClaimsListResponse {
  data: ClaimRecord[];
  message: string;
  isSuccess: boolean;
}

export interface ClaimsQueryParams {
  ProviderId?: string;
  StartDate?: string;
  EndDate?: string;
  HMOId?: string;
  ClaimStatus?: ClaimRecord['claimStatus'];
  isExcel?: boolean;
  PageNumber?: number;
  PageSize?: number;
}

export function fetchClaims(params: ClaimsQueryParams) {
  return api.get<ClaimsListResponse>('/claims/all-claims', { params }).then(r => r.data);
}
