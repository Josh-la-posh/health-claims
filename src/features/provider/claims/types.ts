// Types for provider claims feature
export type ClaimServiceType = 'InpatientCare' | 'OutpatientCare' | 'EmergencyCare' | 'SpecialistVisit' | 'RoutineCare';

export interface ClaimAttachmentMeta {
  id: string;
  hmoId: string;
  filePath: string;
  fileName: string;
  contentType: string;
  createdBy: string;
  modifiedBy: string;
  createdDate: string;
  modifiedDate: string;
  isActive: boolean;
  entityId: string;
  entityType: string;
  propertyType: string;
}

export interface ClaimItemInput {
  serviceRendered: string;
  enrolleeName: string;
  patientEnrolleeNumber: string;
  providerId: string;
  hmoId: string;
  enrolleeEmail: string;
  enrolleePhoneNumber: string;
  claimType: ClaimServiceType;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
  diagnosis: string;
  approvalCode: string;
  referralHospital: string;
  nhisno: string;
  serviceDate: string; // ISO
  attachments: string[]; // for create request only (file ids / placeholders)
}

export interface CreateSingleClaimRequest {
  claimItems: ClaimItemInput[];
  hmoId: string;
  claimDate: string; // ISO date
  claimName: string;
  providerId: string;
}

export interface ClaimItem extends Omit<ClaimItemInput, 'attachments'> {
  id: string;
  claimStatus: string;
  createdDate: string;
  planTypeName?: string;
  planTypeId?: string;
  providerName?: string;
  attachments: ClaimAttachmentMeta[]; // server returns meta objects
}

export interface ClaimListResponse {
  data: ClaimItem[];
  message: string;
  isSuccess: boolean;
}

export interface ClaimDetailResponse {
  data: ClaimItem;
  message: string;
  isSuccess: boolean;
}

export interface CreateBatchClaimParams {
  hmoId: string;
  claimDate: string;
  claimName: string;
  providerId: string;
  file: File;
}

export const CLAIM_SERVICE_OPTIONS: { label: string; value: ClaimServiceType }[] = [
  { label: 'Inpatient care', value: 'InpatientCare' },
  { label: 'Outpatient care', value: 'OutpatientCare' },
  { label: 'Emergency care', value: 'EmergencyCare' },
  { label: 'Specialist visit', value: 'SpecialistVisit' },
  { label: 'Routine care', value: 'RoutineCare' },
];
