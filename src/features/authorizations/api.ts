import { api } from '../../lib/axios';

// TYPES
export interface AuthorizationAttachment {
  id?: string; // returned only
  filePath?: string; // returned only
  fileName?: string; // returned only
  contentType?: string; // returned only
  isActive?: boolean; // returned only
  createdDate?: string; // returned only
}

export interface AuthorizationEntity {
  id: string;
  enrolleeName: string;
  enrolleeIdNumber: string;
  requestDate: string; // ISO
  diagnosis: string;
  requestSource: string;
  referralLetter?: string; // path? returned
  providerId: string;
  hmoId: string;
  requestStatus: string;
  attachments: AuthorizationAttachment[];
  createdDate: string;
}

export interface AuthorizationCreatePayload {
  EnrolleeName: string;
  EnrolleeIdNumber: string;
  RequestDate: string; // ISO
  Diagnosis: string;
  RequestSource: string;
  ReferralLetter?: File | null; // binary file
  ProviderId: string; // uuid
  HMOId: string; // uuid
  RequestStatus?: string; // maybe default by backend
  Attachments?: (File | null)[]; // array of other files
}

export interface AuthorizationResponse { data: AuthorizationEntity; message?: string; isSuccess: boolean; }

// CREATE AUTHORIZATION (multipart/form-data)
export async function createAuthorization(payload: AuthorizationCreatePayload): Promise<AuthorizationResponse> {
  const fd = new FormData();
  Object.entries(payload).forEach(([k,v]) => {
    if(v === undefined || v === null) return;
    if(k === 'Attachments' && Array.isArray(v)) {
      v.forEach((file, idx) => { if(file) fd.append(`Attachments[${idx}]`, file); });
      return;
    }
    if(k === 'ReferralLetter' && v instanceof File) {
      fd.append('ReferralLetter', v);
      return;
    }
    fd.append(k, v as string | Blob);
  });
  const res = await api.post<AuthorizationResponse>('/authorizations', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

// Hook (React Query)
import { useMutation } from '@tanstack/react-query';
import { toast } from '../../lib/toast';

export function useCreateAuthorization() {
  return useMutation({
    mutationFn: createAuthorization,
    onSuccess: () => {
      toast.success('Authorization request submitted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to submit authorization');
    }
  });
}
