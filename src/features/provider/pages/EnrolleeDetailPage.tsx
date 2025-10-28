import { useParams, useNavigate } from 'react-router-dom';
import { useEnrollee, useEnrolleeClaims } from '../../enrollees/hooks';
import { EmptyState, Button } from '../../../components/ui';
import Spinner from '../../../components/ui/spinner';
import { formatDate } from '../../../utils/date';
import type { EnrolleeClaimItem } from '../../enrollees/api';
import { useState } from 'react';
import AuthorizationRequestDialog from '../../authorizations/AuthorizationRequestDialog';
import { ArrowUpRight } from 'lucide-react';

function calcAge(dob?: string) { if(!dob) return ''; const d = new Date(dob); const n = new Date(); let a = n.getFullYear()-d.getFullYear(); const m = n.getMonth()-d.getMonth(); if(m<0||(m===0&&n.getDate()<d.getDate())) a--; return a + 'yrs'; }
function initials(first?: string, last?: string){ const f = (first||'').charAt(0); const l = (last||'').charAt(0); return (f+l||'EN').toUpperCase(); }

export default function ProviderEnrolleeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detailQuery = useEnrollee(id || undefined);
  const enrolleeNumber = detailQuery.data?.data?.enrolleeIdNumber;
  const claimsQuery = useEnrolleeClaims(enrolleeNumber);
  const enrollee = detailQuery.data?.data;
  const dependents = enrollee?.dependents || [];
  const [tab, setTab] = useState<'personal'|'dependents'|'claims'>('personal');
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className='p-6 space-y-8'>
      {detailQuery.isLoading && <div className='py-20 flex justify-center'><Spinner /></div>}
      {detailQuery.isError && <div className='text-sm text-destructive'>Failed to load enrollee.</div>}
      {enrollee && (
        <>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <Button variant='outline' size='sm' onClick={()=> navigate(-1)}>Back</Button>
          </div>
          <div className='rounded-md border border-dashed border-primary/40 p-4 flex items-start justify-between gap-4 mt-2'>
            <div className='flex items-center gap-4'>
              <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground overflow-hidden'>
                {enrollee.photoName ? (
                  <img
                    src={enrollee.photoName}
                    alt={`${enrollee.firstName} ${enrollee.lastName}`}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  initials(enrollee.firstName, enrollee.lastName)
                )}
              </div>
              <div>
                <div className='font-semibold text-base'>{enrollee.firstName} {enrollee.lastName}</div>
                <div className='text-xs mt-1'>{enrollee.enrolleeIdNumber}</div>
              </div>
              <div className={`ml-4 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${enrollee.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-muted border-border text-muted-foreground'}`}>
                {enrollee.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div>
              <Button onClick={()=> setAuthOpen(true)}>Request authorization</Button>
            </div>
          </div>

          {/* Tabbed Card */}
          <div className='rounded-md border border-border'>
            <div className='flex gap-10 px-6 pt-4 text-sm font-medium'>
              {['personal','dependents','claims'].map(t => (
                <button
                  key={t}
                  onClick={()=> setTab(t as any)}
                  className={`relative pb-3 transition-colors ${tab===t ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {t==='personal' ? 'Personal details' : t.charAt(0).toUpperCase()+t.slice(1)}
                  {tab===t && <span className='absolute left-0 -bottom-px h-[2px] w-full bg-primary rounded' />}
                </button>
              ))}
            </div>
            <div className='h-px w-full bg-border' />
            <div className='p-6 space-y-6'>
              {tab==='personal' && (
                <div className='space-y-12'>
                  <div className='grid md:grid-cols-2 gap-x-12 gap-y-6 text-sm'>
                    <div><div className='text-muted-foreground text-xs'>ID number</div><div className='font-semibold mt-1'>{enrollee.enrolleeIdNumber}</div></div>
                    <div><div className='text-muted-foreground text-xs'>Gender</div><div className='font-semibold mt-1'>{enrollee.gender}</div></div>
                    <div><div className='text-muted-foreground text-xs'>Phone number</div><div className='font-semibold mt-1'>{enrollee.phoneNumber || '-'}</div></div>
                    <div><div className='text-muted-foreground text-xs'>HMO Class</div><div className='font-semibold mt-1'>{enrollee.enrolleeClass?.name || '-'}</div></div>
                    <div className='mt-2'>
                      <Button variant='outline' size='sm' className='inline-flex items-center gap-1'>
                        View plan <ArrowUpRight className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                  <div className='space-y-6'>
                    <div className='font-medium text-sm'>Next of kin information</div>
                    {enrollee.nextOfKin ? (
                      <div className='grid md:grid-cols-2 gap-x-12 gap-y-5 text-sm'>
                        <div><div className='text-muted-foreground text-xs'>Full name</div><div className='font-semibold mt-1'>{enrollee.nextOfKin.fullName || '-'}</div></div>
                        <div><div className='text-muted-foreground text-xs'>Relationship</div><div className='font-semibold mt-1'>{enrollee.nextOfKin.relationship || '-'}</div></div>
                        <div><div className='text-muted-foreground text-xs'>Phone number</div><div className='font-semibold mt-1'>{enrollee.nextOfKin.phoneNumber || '-'}</div></div>
                        <div><div className='text-muted-foreground text-xs'>Home address</div><div className='font-semibold mt-1'>{enrollee.nextOfKin.homeAddress || '-'}</div></div>
                      </div>
                    ) : <EmptyState title='No next of kin info' description='Next of kin details not provided.' />}
                  </div>
                </div>
              )}
              {tab==='dependents' && (
                dependents.length === 0 ? <EmptyState title='No dependents' description='No dependents have been added.' /> : (
                  <div className='space-y-2'>
                    <table className='w-full text-sm'>
                      <thead className='bg-emerald-50/60'>
                        <tr>
                          <th className='text-left px-6 py-3 font-medium'>Name</th>
                          <th className='text-left px-6 py-3 font-medium'>Gender</th>
                          <th className='text-left px-6 py-3 font-medium'>Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dependents.map((d:any) => (
                          <tr key={d.id} className='border-t border-border'>
                            <td className='px-6 py-4'>{d.firstName} {d.lastName}</td>
                            <td className='px-6 py-4'>{d.gender}</td>
                            <td className='px-6 py-4'>{calcAge(d.dateOfBirth)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
              {tab==='claims' && (
                claimsQuery.isLoading ? <Spinner /> : (
                  (claimsQuery.data?.data?.length ?? 0) === 0 ? <EmptyState title='No claims yet' description='Claims for this enrollee will appear here.' /> : (
                    <div className='space-y-3'>
                      <table className='w-full text-sm'>
                        <thead className='bg-border/40'>
                          <tr>
                            <th className='text-left px-3 py-2 font-medium'>Date</th>
                            <th className='text-left px-3 py-2 font-medium'>Claim ID</th>
                            <th className='text-left px-3 py-2 font-medium'>Amount</th>
                            <th className='text-left px-3 py-2 font-medium'>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {claimsQuery.data!.data.map((c: EnrolleeClaimItem) => (
                            <tr key={c.id} className='border-t border-border'>
                              <td className='px-3 py-2'>{formatDate(c.createdDate,'dd/MM/yyyy')}</td>
                              <td className='px-3 py-2'>{c.patientEnrolleeNumber || c.id.slice(0,8)}</td>
                              <td className='px-3 py-2'>₦{(c.amount||0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                              <td className='px-3 py-2'>{c.claimStatus}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )
              )}
            </div>
          </div>

          {/* NOK moved into personal tab */}
          {/* NOTE: providerId must be supplied from provider context/store; using empty string placeholder for now */}
          <AuthorizationRequestDialog
            open={authOpen}
            onOpenChange={setAuthOpen}
            enrolleeName={`${enrollee.firstName} ${enrollee.lastName}`.trim()}
            enrolleeIdNumber={enrollee.enrolleeIdNumber}
            providerId={''}
            hmoId={enrollee.hmoId}
          />
        </>
      )}
    </div>
  );
}
