import { useForm } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { User, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '../../../store/auth';
import { useUpdateUser } from '../hooks';

type ProfileFormValues = { firstName: string; lastName: string; email: string; phoneNumber: string };

export default function ProfilePage(){
  const user = useAuthStore.getState().user;
  const mut = useUpdateUser();
  const { register, handleSubmit, formState:{ errors } } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phoneNumber: ''
    }
  });
  function onSubmit(values: ProfileFormValues){ if(!user?.id) return; mut.mutate({ id: user.id, ...values }); }
  return (
    <div className='max-w-2xl space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Personal details</h1>
        <p className='text-sm text-muted-foreground'>Update your basic account information.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Input label='First name' leftIcon={<User size={16} />} state={errors.firstName?'error':'default'} helper={errors.firstName?.message as string} {...register('firstName',{ required:'First name is required' })} />
          <Input label='Last name' leftIcon={<User size={16} />} state={errors.lastName?'error':'default'} helper={errors.lastName?.message as string} {...register('lastName',{ required:'Last name is required' })} />
        </div>
        <Input label='Email address' type='email' leftIcon={<Mail size={16} />} state={errors.email?'error':'default'} helper={errors.email?.message as string} {...register('email',{ required:'Email is required', pattern:{ value:/\S+@\S+\.\S+/, message:'Invalid email' } })} />
        <Input label='Phone number' type='tel' leftIcon={<Phone size={16} />} state={errors.phoneNumber?'error':'default'} helper={errors.phoneNumber?.message as string} {...register('phoneNumber',{ required:'Phone number is required' })} />
        <Button type='submit' disabled={mut.isPending}>{mut.isPending? 'Updating...':'Save changes'}</Button>
      </form>
    </div>
  );
}
