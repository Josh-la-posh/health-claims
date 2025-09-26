import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

export default function EnrolleeRegistrationPage() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState<'individual' | 'corporate'>('individual');

  function handleContinue() {
    if (selection === 'individual') navigate('/hmo/enrollees/register/individual');
    else navigate('/hmo/enrollees/register/corporate');
  }

  return (
    <div className="flex justify-center">
        <form
            onSubmit={(e)=> { e.preventDefault(); handleContinue(); }}
            className="w-full lg:w-[700px] flex justify-center space-y-6 md:space-y-12 bg-bg border-border border rounded-lg py-10 lg:py-20"
        >
            <fieldset className="space-y-8">
                <legend className="text-lg md:text-2xl font-medium text-primary">Registration Type</legend>
                <div className="flex gap-6 md:gap-16">
                    <label className="flex items-start gap-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                        <input
                        type="radio"
                        name="reg-type"
                        value="individual"
                        checked={selection==='individual'}
                        onChange={()=> setSelection('individual')}
                        className="mt-1 accent-primary"
                        />
                        <div className="space-y-1">
                        <span className="block text-sm font-medium">Individual Registration</span>
                        {/* <span className="block text-xs leading-relaxed text-muted">Capture personal details, next of kin then proceed to plan details.</span> */}
                        </div>
                    </label>
                    <label className="flex items-start gap-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors">
                        <input
                        type="radio"
                        name="reg-type"
                        value="corporate"
                        checked={selection==='corporate'}
                        onChange={()=> setSelection('corporate')}
                        className="mt-1 accent-primary"
                        />
                        <div className="space-y-1">
                        <span className="block text-sm font-medium">Corporate Registration</span>
                        {/* <span className="block text-xs leading-relaxed text-muted">Register a corporate entity (no plan details step).</span> */}
                        </div>
                    </label>
                </div>
                <Button type="submit">Next</Button>
            </fieldset>
        </form>
    </div>
  );
}
