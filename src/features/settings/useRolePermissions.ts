import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchRolePermissions, updateRolePermissions, type RolePermissionClaim } from './rolePermissionsApi';
import { queryClient } from '../../lib/queryClient';
import { toast } from 'sonner';

export function useRolePermissions(roleId: string | undefined){
  return useQuery({
    queryKey: ['role-permissions', roleId],
    enabled: !!roleId,
    queryFn: async () => {
      if(!roleId) return [] as RolePermissionClaim[];
      const res = await fetchRolePermissions(roleId);
      return res.data || [];
    }
  });
}

export function useUpdateRolePermissions(roleId: string | undefined){
  return useMutation({
    mutationFn: (claims: RolePermissionClaim[]) => {
      if(!roleId) throw new Error('roleId required');
      return updateRolePermissions(roleId, claims);
    },
    onMutate: async (newClaims) => {
      if(!roleId) return;
      await queryClient.cancelQueries({ queryKey: ['role-permissions', roleId] });
      const prev = queryClient.getQueryData<RolePermissionClaim[]>(['role-permissions', roleId]);
      queryClient.setQueryData(['role-permissions', roleId], newClaims);
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if(ctx?.prev && roleId){
        queryClient.setQueryData(['role-permissions', roleId], ctx.prev);
      }
      toast.error((err as Error).message || 'Failed to update permissions');
    },
    // Success dialog handled in UI layer now; no success toast to avoid duplication
    onSettled: () => {
      if(roleId) queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] });
    }
  });
}