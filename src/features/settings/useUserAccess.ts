import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, type CreateUserPayload, type UpdateUserPayload, type AccessUser } from './userAccessApi';
import { queryClient } from '../../lib/queryClient';
import { toast } from 'sonner';

export function useUsers(hmoId: string | undefined){
  return useQuery({
    queryKey: ['users', hmoId],
    enabled: !!hmoId,
    queryFn: async () => {
      if(!hmoId) return [] as AccessUser[];
      const res = await fetchUsers(hmoId);
      return res.data || [];
    }
  });
}

export function useCreateUser(hmoId: string | undefined){
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'User created');
      queryClient.invalidateQueries({ queryKey: ['users', hmoId] });
    }
  });
}

export function useUpdateUser(hmoId: string | undefined){
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateUser(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'User updated');
      queryClient.invalidateQueries({ queryKey: ['users', hmoId] });
    }
  });
}

// Future: useDeleteUser, useAssignUserRole, useResendInvite etc.