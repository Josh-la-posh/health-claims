import { useState } from 'react';
import ProfilePage from '../../settings/pages/ProfilePage';
import SecurityPage from '../../settings/pages/SecurityPage';

export default function ProviderSettingsPage(){
  const [active, setActive] = useState<'profile'|'security'>('profile');
  return (
    <div className='p-6'>
      <div className='border-b mb-6 flex gap-8 text-sm font-medium'>
        <button onClick={()=>setActive('profile')} className={`py-2 -mb-px border-b-2 transition-colors ${active==='profile' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground hover:border-muted'}`}>Personal details</button>
        <button onClick={()=>setActive('security')} className={`py-2 -mb-px border-b-2 transition-colors ${active==='security' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground hover:border-muted'}`}>Security</button>
      </div>
      {active === 'profile' && <ProfilePage />}
      {active === 'security' && <SecurityPage />}
    </div>
  );
}
