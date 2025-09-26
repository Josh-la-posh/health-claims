import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import {
  fetchEnrolleeClasses,
  createEnrolleeClass,
  updateEnrolleeClass,
  activateEnrolleeClass,
  deactivateEnrolleeClass,
  type EnrolleeClass,
  type CreateEnrolleeClassPayload,
  type UpdateEnrolleeClassPayload
} from './enrolleeClassApi';
import { toast } from 'sonner';

export function useEnrolleeClasses(){
  return useQuery({
    queryKey: ['enrollee-classes'],
    queryFn: async () => {
      const res = await fetchEnrolleeClasses();
      return res.data as EnrolleeClass[];
    }
  });
}

export function useCreateEnrolleeClass(){
  return useMutation({
    mutationFn: (payload: CreateEnrolleeClassPayload) => createEnrolleeClass(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Created');
      queryClient.invalidateQueries({ queryKey: ['enrollee-classes'] });
    }
  });
}

export function useUpdateEnrolleeClass(){
  return useMutation({
    mutationFn: (payload: UpdateEnrolleeClassPayload) => updateEnrolleeClass(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Updated');
      queryClient.invalidateQueries({ queryKey: ['enrollee-classes'] });
    }
  });
}

export function useActivateEnrolleeClass(){
  return useMutation({
    mutationFn: (id: string) => activateEnrolleeClass(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Activated');
      queryClient.invalidateQueries({ queryKey: ['enrollee-classes'] });
    }
  });
}

export function useDeactivateEnrolleeClass(){
  return useMutation({
    mutationFn: (id: string) => deactivateEnrolleeClass(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Deactivated');
      queryClient.invalidateQueries({ queryKey: ['enrollee-classes'] });
    }
  });
}
