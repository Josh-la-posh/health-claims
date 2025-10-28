import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateUser, changePassword, type UpdateUserBody, type ChangePasswordBody } from './api';

export function useUpdateUser(){
  return useMutation({
    mutationFn: (body: UpdateUserBody) => updateUser(body),
    onSuccess: () => toast.success('Profile updated'),
    onError: (err: any) => toast.error(err?.message || 'Failed to update profile')
  });
}

export function useChangePassword(){
  return useMutation({
    mutationFn: (body: ChangePasswordBody) => changePassword(body),
    onSuccess: () => toast.success('Password changed'),
    onError: (err: any) => toast.error(err?.message || 'Failed to change password')
  });
}
