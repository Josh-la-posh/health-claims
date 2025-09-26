import { api } from '../../lib/axios';

export type RoleItem = {
  id: string;
  name: string;
  normalizedName: string;
  concurrencyStamp: string | null;
};

export type RolesListResponse = {
  data: RoleItem[];
  message?: string;
  isSuccess?: boolean;
};

export type CreateRolePayload = { roleName: string };
export type CreateRoleResponse = { data: boolean; message: string; isSuccess: boolean };

export async function fetchRoles(){
  const { data } = await api.get<RolesListResponse>('/roles');
  return data;
}

export async function createRole(payload: CreateRolePayload){
  const { data } = await api.post<CreateRoleResponse>('/roles', payload);
  return data;
}

// Future: updateRole, deleteRole, assignPermissions etc.