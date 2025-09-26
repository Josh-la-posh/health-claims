import { api } from '../../lib/axios';

export type AccessUser = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  roles: string[];
  isProvider: boolean;
  // Backend may later add lastLogin; placeholder client derived.
};

export type UsersListResponse = {
  data: AccessUser[];
  message: string;
  isSuccess: boolean;
};

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phoneNumber: string;
};

export type UpdateUserPayload = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
};

export type UserSingleResponse = {
  data: AccessUser;
  message: string;
  isSuccess: boolean;
};

export async function fetchUsers(hmoId: string){
  const { data } = await api.get<UsersListResponse>(`/users/hmos/${hmoId}`);
  return data;
}

export async function createUser(payload: CreateUserPayload){
  const { data } = await api.post<UserSingleResponse>('/users', payload);
  return data;
}

export async function updateUser(payload: UpdateUserPayload){
  const { id, ...rest } = payload;
  const { data } = await api.put<UserSingleResponse>(`/users/${id}`, { id, ...rest });
  return data;
}

// Future: deleteUser, assignUserRole, resendInvite, deactivateUser etc.