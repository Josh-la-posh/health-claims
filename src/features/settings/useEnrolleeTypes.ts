import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { fetchEnrolleeTypes, activateEnrolleeType, deactivateEnrolleeType, createEnrolleeType, updateEnrolleeType, type EnrolleeType, type CreateEnrolleeTypePayload, type UpdateEnrolleeTypePayload } from './enrolleeTypeApi';
import { toast } from 'sonner';

export function useEnrolleeTypes(){
  return useQuery({
    queryKey: ['enrollee-types'],
    queryFn: async () => {
      const res = await fetchEnrolleeTypes();
      return res.data as EnrolleeType[];
    }
  });
}

export function useActivateEnrolleeType(){
  return useMutation({
    mutationFn: (id: string) => activateEnrolleeType(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Activated');
      queryClient.invalidateQueries({ queryKey: ['enrollee-types'] });
    }
  });
}

export function useDeactivateEnrolleeType(){
  return useMutation({
    mutationFn: (id: string) => deactivateEnrolleeType(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Deactivated');
      queryClient.invalidateQueries({ queryKey: ['enrollee-types'] });
    }
  });
}

export function useCreateEnrolleeType(){
  return useMutation({
    mutationFn: (payload: CreateEnrolleeTypePayload) => createEnrolleeType(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Created');
      queryClient.invalidateQueries({ queryKey: ['enrollee-types'] });
    }
  });
}

export function useUpdateEnrolleeType(){
  return useMutation({
    mutationFn: (payload: UpdateEnrolleeTypePayload) => updateEnrolleeType(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Updated');
      queryClient.invalidateQueries({ queryKey: ['enrollee-types'] });
    }
  });
}
