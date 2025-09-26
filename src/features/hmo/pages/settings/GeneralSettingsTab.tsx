import { useState, useEffect, useRef } from 'react';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { PhoneInputWithDialCode, type DialCodeCountry } from '../../../../components/ui/phone-input';
import { Dialog } from '../../../../components/ui/dialog';
import { useAuthStore } from '../../../../store/auth';
import { useUpdateUser, useChangePassword } from '../../../../features/auth/hooks';
import { CheckCircle } from 'lucide-react';
import { toastOnce } from '../../../../lib/toast';

// Placeholder countries list until wired to user profile / resources (reuse enrollee countries if needed later)
const staticCountries: DialCodeCountry[] = [
  { name: 'Nigeria', alpha2: 'NG', dailingCodes: ['234'] }
];

export default function GeneralSettingsTab(){
  const user = useAuthStore(s => s.user);
  // Derive simple first/last from single name field if backend only supplies full name
  const derivedFirst = user?.name?.split(/\s+/)[0] || '';
  const derivedLast = user?.name?.split(/\s+/).slice(1).join(' ') || '';
  const initial = { firstName: derivedFirst, lastName: derivedLast, email: user?.email || '', phone: '+234' };
  const [profile, setProfile] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ current: profile.email, next: '', confirm: '', password: '' });
  const updateUser = useUpdateUser();
  const changePassword = useChangePassword();
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwDraft, setPwDraft] = useState({ current: '', next: '', confirm: '' });
  const [success, setSuccess] = useState<{ open: boolean; title: string; body: string }>({ open: false, title: '', body: '' });
  const successTimerRef = useRef<number | null>(null);
  const AUTO_CLOSE_MS = 3500;
  const [progress, setProgress] = useState(0); // 0 -> 100

  // Rehydrate if user changes (e.g. after refresh or profile fetch)
  useEffect(()=> {
    const updated = { firstName: derivedFirst, lastName: derivedLast, email: user?.email || '', phone: profile.phone };
    setProfile(updated);
    if(!editing) setDraft(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.name]);

  function handleSaveProfile(){
    if(!user) return;
    updateUser.mutate({
      id: user.id,
      firstName: draft.firstName,
      lastName: draft.lastName,
      phoneNumber: draft.phone.replace(/[^0-9+]/g,''),
      email: draft.email,
    }, {
      onSuccess: (res) => {
        if(res.isSuccess){
          setProfile(draft);
          setEditing(false);
          setSuccess({ open: true, title: 'Profile Updated', body: 'Your personal details have been saved successfully.' });
        }
      }
    });
  }

  // Auto close success dialog with progress bar
  useEffect(()=> {
    if(success.open){
      setProgress(0);
      const started = performance.now();
      function tick(now: number){
        const delta = now - started;
        const pct = Math.min(100, (delta / AUTO_CLOSE_MS) * 100);
        setProgress(pct);
        if(pct < 100 && success.open){
          successTimerRef.current = requestAnimationFrame(tick) as unknown as number;
        } else if(pct >= 100){
          setSuccess(s=> ({ ...s, open: false }));
        }
      }
      successTimerRef.current = requestAnimationFrame(tick) as unknown as number;
      return () => { if(successTimerRef.current) cancelAnimationFrame(successTimerRef.current); };
    } else {
      if(successTimerRef.current) cancelAnimationFrame(successTimerRef.current);
    }
  }, [success.open]);

  function handleChangeEmail(e: React.FormEvent){
    e.preventDefault();
    // TODO: integrate change email mutation + validation
    if(emailDraft.next && emailDraft.next === emailDraft.confirm){
      if(!user){
        toastOnce('error','No user in session');
        return;
      }
      updateUser.mutate({
        id: user.id,
        firstName: draft.firstName,
        lastName: draft.lastName,
        phoneNumber: draft.phone.replace(/[^0-9+]/g,''),
        email: emailDraft.next,
      }, {
        onSuccess: (res) => {
          if(res.isSuccess){
            setProfile(p=> ({ ...p, email: emailDraft.next }));
            setDraft(d=> ({ ...d, email: emailDraft.next }));
            setEmailModalOpen(false);
            setSuccess({ open: true, title: 'Email Updated', body: 'Your email address has been changed successfully.' });
          }
        }
      });
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-sm md:text-base font-semibold tracking-wide">Personal details</h2>
        {!editing ? (
          <Button onClick={()=> { setDraft(profile); setEditing(true); }}>Update Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=> { setDraft(profile); setEditing(false); }}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={updateUser.isPending}>{updateUser.isPending ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        )}
      </div>
      <form className="space-y-8" onSubmit={(e)=> { e.preventDefault(); if(editing) handleSaveProfile(); }}>
        <div className="grid md:grid-cols-2 gap-6">
          <Input label="First name" value={draft.firstName} disabled={!editing} onChange={e=> setDraft(d=> ({ ...d, firstName: e.target.value }))} />
          <Input label="Last name" value={draft.lastName} disabled={!editing} onChange={e=> setDraft(d=> ({ ...d, lastName: e.target.value }))} />
          <div className="space-y-1 md:col-span-1">
            <Input label="Email address" value={draft.email} disabled />
            <Dialog.Root open={emailModalOpen} onOpenChange={setEmailModalOpen}>
              <Dialog.Trigger asChild>
                <Button type="button" variant="ghost" className="px-0 h-auto font-medium text-primary">Update Email</Button>
              </Dialog.Trigger>
              <Dialog.Content className="max-w-md  lg:max-w-2xl">
                <Dialog.Header>
                  <Dialog.Title>Change Email</Dialog.Title>
                </Dialog.Header>
                <form className="space-y-4 px-4 py-4" onSubmit={handleChangeEmail}>
                  <Input label="Current Email" value={emailDraft.current} disabled />
                  <Input label="New Email" type="email" required value={emailDraft.next} onChange={e=> setEmailDraft(s=> ({ ...s, next: e.target.value }))} />
                  <Input label="Confirm New Email" type="email" required value={emailDraft.confirm} onChange={e=> setEmailDraft(s=> ({ ...s, confirm: e.target.value }))} />
                  <Input label="Password" type="password" required value={emailDraft.password} onChange={e=> setEmailDraft(s=> ({ ...s, password: e.target.value }))} helper={emailDraft.next !== emailDraft.confirm && emailDraft.confirm ? 'Emails do not match' : undefined} state={emailDraft.next !== emailDraft.confirm && emailDraft.confirm ? 'error' : undefined} />
                  <Dialog.Footer>
                    <Button type="submit" disabled={!emailDraft.next || emailDraft.next !== emailDraft.confirm || updateUser.isPending}>{updateUser.isPending ? 'Saving...' : 'Save Changes'}</Button>
                  </Dialog.Footer>
                </form>
              </Dialog.Content>
            </Dialog.Root>
          </div>
          <div>
            <PhoneInputWithDialCode
              label="Phone number"
              value={draft.phone}
              countries={staticCountries}
              disabled={!editing}
              onChange={(v)=> setDraft(d=> ({ ...d, phone: v }))}
            />
          </div>
        </div>
        <hr className="border-border" />
        {/* Password + 2FA section placeholder (2FA ignored per spec) */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Password</h3>
            <Dialog.Root open={pwModalOpen} onOpenChange={setPwModalOpen}>
              <Dialog.Trigger asChild>
                <Button type="button" variant="outline">Change Password</Button>
              </Dialog.Trigger>
              <Dialog.Content className="max-w-md lg:max-w-2xl">
                <Dialog.Header>
                  <Dialog.Title>Change Password</Dialog.Title>
                </Dialog.Header>
                <form
                  className="space-y-4 px-4 py-4"
                  onSubmit={(e)=> {
                    e.preventDefault();
                    if(!pwDraft.next || pwDraft.next !== pwDraft.confirm) return;
                    changePassword.mutate(
                      { currentPassword: pwDraft.current, newPassword: pwDraft.next },
                      { onSuccess: (res)=> {
                          if(res.isSuccess){
                            setPwModalOpen(false);
                            setPwDraft({ current:'', next:'', confirm:''});
                            setSuccess({ open: true, title: 'Password Changed', body: 'Your password has been updated successfully. Please use the new password next time you sign in.' });
                          }
                        }
                      }
                    );
                  }}
                >
                  <Input label="Old password" type="password" required value={pwDraft.current} onChange={e=> setPwDraft(s=> ({ ...s, current: e.target.value }))} />
                  <Input label="New password" type="password" required value={pwDraft.next} onChange={e=> setPwDraft(s=> ({ ...s, next: e.target.value }))} />
                  <Input label="Confirm password" type="password" required value={pwDraft.confirm} onChange={e=> setPwDraft(s=> ({ ...s, confirm: e.target.value }))} helper={pwDraft.confirm && pwDraft.next !== pwDraft.confirm ? 'Passwords do not match' : undefined} state={pwDraft.confirm && pwDraft.next !== pwDraft.confirm ? 'error' : undefined} />
                  <Dialog.Footer>
                    <Button type="submit" disabled={!pwDraft.current || !pwDraft.next || pwDraft.next !== pwDraft.confirm || changePassword.isPending}>{changePassword.isPending ? 'Updating...' : 'Save Changes'}</Button>
                  </Dialog.Footer>
                </form>
              </Dialog.Content>
            </Dialog.Root>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Two factor Authentication</h3>
            <p className="text-xs text-muted-foreground">(Ignored for now)</p>
          </div>
        </div>
      </form>
      {/* Global Success Dialog */}
      <Dialog.Root open={success.open} onOpenChange={(o)=> setSuccess(s=> ({ ...s, open: o }))}>
        <Dialog.Content className="max-w-sm lg:max-w-2xl text-center space-y-4">
          <Dialog.Header>
            <Dialog.Title className="sr-only">{success.title}</Dialog.Title>
          </Dialog.Header>
          <div className="flex justify-center">
            <CheckCircle className="text-emerald-600" size={56} />
          </div>
            <h3 className="text-base font-semibold">{success.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{success.body}</p>
          <div className="h-1 w-full rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-[width] ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Dialog.Footer>
            <Button className="w-full" onClick={()=> setSuccess(s=> ({ ...s, open: false }))}>Close</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
