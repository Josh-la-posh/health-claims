import type { DialCodeCountry } from '../components/ui/phone-input';

// Central shared list of dial code countries. Extend as backend/resources grows.
export const dialCountries: DialCodeCountry[] = [
  { name: 'Nigeria', alpha2: 'NG', dailingCodes: ['234'] },
];
