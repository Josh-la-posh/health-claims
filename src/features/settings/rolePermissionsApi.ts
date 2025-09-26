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

export async function updateRolePermissions(roleId: string, roleClaims: RolePermissionClaim[]){
  const { data } = await api.put<RolePermissionsResponse>(`/permissions/${roleId}`, { roleId, roleClaims });
  return data;
}