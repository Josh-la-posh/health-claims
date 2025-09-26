import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchRoles, createRole, type CreateRolePayload, type RoleItem } from './rolesApi';
import { queryClient } from '../../lib/queryClient';
import { toast } from 'sonner';

export function useRoles(){
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await fetchRoles();
      return (res.data || []) as RoleItem[];
    }
  });
}

export function useCreateRole(){
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: (res) => {
      if(res.isSuccess){
        toast.success(res.message || 'Role created');
      } else {
        toast.error(res.message || 'Failed to create role');
      }
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
}

// Future: deleteRole, updateRole, assignPermissions etc.