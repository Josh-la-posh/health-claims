import { api } from '../../lib/axios';

export type RolePermissionClaim = {
  type: string;
  value: string;
  selected: boolean;
};

export type RolePermissionsResponse = {
  data: RolePermissionClaim[];
  message: string;
  isSuccess: boolean;
};

export async function fetchRolePermissions(roleId: string){
  const { data } = await api.get<RolePermissionsResponse>(`/permissions/${roleId}`);
  return data;
}

export async function updateRolePermissions(roleId: string, claims: RolePermissionClaim[]){
  // NOTE: endpoint spelling per spec has triple 's' ( /permisssions/ ) — keeping as provided; adjust if backend differs
  const { data } = await api.put<RolePermissionsResponse>(`/permisssions/${roleId}`, {
    roleId,
    roleClaims: claims,
  });
  return data;
}

// Future: add diff utilities or grouping functions here.