import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { CorporateType, CorporateCategory } from '../../types/enrollee';

export interface Corporate {
  corporateType: string;
  corporateCatgory: string; // note: API field spelling preserved
  companyName: string;
  email: string;
  phoneNumber: string;
  officeAddress: string;
  enrolleeClassId: string;
  id: string;
  enrolleeIdNumber: string;
  hmoId: string;
  isActive: boolean;
  createdDate: string;
  enrolleeClass?: {
    name: string;
    description?: string;
    id: string;
    isActive: boolean;
    createdDate: string;
  };
}

export function useCorporates() {
  return useQuery({
    queryKey: ['corporates','all'],
    queryFn: async () => {
      const res = await api.get('/corporates');
      return res.data?.data as Corporate[];
    }
  });
}

export interface CreateCorporatePayload {
  corporateType: string | CorporateType; // allow numeric enum value
  corporateCatgory: string | CorporateCategory; // allow numeric enum value
  companyName: string;
  email: string;
  phoneNumber: string;
  officeAddress: string;
  enrolleeClassId: string;
}

export function useCreateCorporate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCorporatePayload) => {
      const res = await api.post('/corporates', payload);
      return res.data?.data as Corporate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['corporates','all'] });
    }
  });
}
