export interface NextOfKin {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  homeAddress: string;
  id?: string;
  isActive?: boolean;
  hmoId?: string;
  enrolleeId?: string;
  createdDate?: string; // ISO
}

// Enum-like constant objects (TS 'enum' syntax disallowed under current compiler settings)
export const CorporateType = {
  Employer: 1,
  TPA: 2,
  Sponsor: 3,
} as const;
export type CorporateType = typeof CorporateType[keyof typeof CorporateType];

export const BillingFrequency = {
  Monthly: 1,
  Quaterly: 2, // original spelling from request; consider adding alias Quarterly
  Yearly: 3,
} as const;
export type BillingFrequency = typeof BillingFrequency[keyof typeof BillingFrequency];

// Corporate Category enum-like mapping (requested values)
export const CorporateCategory = {
  Bank: 1,
  NGO: 2,
  Church: 3,
  Agency: 4,
} as const;
export type CorporateCategory = typeof CorporateCategory[keyof typeof CorporateCategory];

export interface Dependent {
  enrolleeId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string; // ISO
  id: string;
  photoName?: string;
  isActive?: boolean;
  createdDate?: string; // ISO
}

export interface NamedEntity {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdDate?: string; // ISO
  hmoId?: string; // present on planType
}

export interface EnrolleeEntity {
  firstName: string;
  lastName: string;
  otherName?: string;
  phoneNumber: string;
  emailAddress: string;
  enrolleeTypeId: string;
  enrolleeClassId: string;
  dateOfBirth: string; // ISO
  fullAddress: string;
  stateOfResidence: string;
  gender: string;
  occupation?: string;
  maritalStatus?: string;
  ethnicity?: string;
  nationality?: string;
  corporateId?: string; // present for corporate
  planTypeId?: string; // becomes required after first step
  nextOfKinCreate?: Omit<NextOfKin, "id" | "isActive" | "createdDate" | "hmoId" | "enrolleeId">;
  id: string;
  hmoId: string;
  photoName?: string;
  enrolleeIdNumber?: string;
  createdDate: string; // ISO
  isActive: boolean;
  nextOfKin?: NextOfKin;
  dependents?: Dependent[];
  enrolleeClass?: NamedEntity;
  enrolleeType?: NamedEntity;
  planType?: NamedEntity;
}

export interface EnrolleeListResponse {
  data: EnrolleeEntity[];
  message?: string;
  isSuccess: boolean;
}

export interface EnrolleeDetailResponse {
  data: EnrolleeEntity;
  message?: string;
  isSuccess: boolean;
}

export interface EnrolleeListParams {
  HMOId: string; // required
  EnrolleeNumber?: string;
  EnrolleeName?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface CreateOrUpdateEnrolleePayload {
  id?: string; // required for update
  FirstName: string;
  LastName: string;
  OtherName?: string;
//   Photo?: File | null;
  Photo?: string;
  PhoneNumber: string;
  EmailAddress: string;
  EnrolleeTypeId: string;
  EnrolleeClassId: string;
  DateOfBirth: string; // ISO
  FullAddress: string;
  StateOfResidence: string;
  LGAOfResidence?: string; // newly added (backend field assumption)
  Gender: string;
  Occupation?: string;
  MaritalStatus?: string;
  Ethnicity?: string;
  Nationality?: string;
  CorporateId?: string;
  PlanTypeId?: string; // becomes required before plan detail creation
  "NextOfKineCreate.FullName"?: string;
  "NextOfKineCreate.Relationship"?: string;
  "NextOfKineCreate.PhoneNumber"?: string;
  "NextOfKineCreate.HomeAddress"?: string;
}

export interface PlanDetailPayload {
  planTypeId: string;
  memberTypeId: string; // enrolleeTypeId
  amount: number;
  discount: number;
  referralNumber?: string;
  benefits?: string;
  billingFrequency: BillingFrequency | string; // numeric code OR backend string label
}

export interface PlanDetailResponse {
  data: {
    planTypeId: string;
    memberTypeId: string;
    amount: number;
    discount: number;
    referralNumber?: string;
    benefits?: string;
  billingFrequency: BillingFrequency | string;
    id: string;
    isActive: boolean;
    planType?: { name: string; description?: string };
    memberType?: { name: string; description?: string };
    createdDate: string;
  };
  message?: string;
  isSuccess: boolean;
}

export interface NamedListResponse<T = NamedEntity> {
  data: T[];
  message?: string;
  isSuccess: boolean;
}
