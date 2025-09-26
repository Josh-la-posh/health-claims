import { api } from "../../lib/axios"; // relative path (no path alias configured)
import type {
  EnrolleeListParams,
  EnrolleeListResponse,
  EnrolleeDetailResponse,
  CreateOrUpdateEnrolleePayload,
  PlanDetailPayload,
  PlanDetailResponse,
  NamedListResponse,
} from "../../types/enrollee";
// Additional lightweight response shapes for resource arrays
export interface StringArrayResponse {
  data: string[];
  message?: string;
  isSuccess: boolean;
}

export interface CountryItem { name: string; alpha2: string; alpha3: string; numericCode: number; dailingCodes: string[]; }
export interface CountriesResponse { data: CountryItem[]; message?: string; isSuccess: boolean; }
export interface StateItem { id: string; isActive: boolean; countryCode: string | null; name: string; createdDate: string; }
export interface StatesResponse { data: StateItem[]; message?: string; isSuccess: boolean; }
export interface LgaItem { id: string; isActive: boolean; countryCode: string | null; name: string; createdDate: string; }
export interface LgasResponse { data: LgaItem[]; message?: string; isSuccess: boolean; }

// LIST ENROLLEES
export async function listEnrollees(params: EnrolleeListParams): Promise<EnrolleeListResponse> {
  const res = await api.get<EnrolleeListResponse>("/enrollees", { params });
  return res.data;
}

// ENROLLEE DETAIL
export async function getEnrollee(id: string): Promise<EnrolleeDetailResponse> {
  const res = await api.get<EnrolleeDetailResponse>(`/enrollees/${id}`);
  return res.data;
}

// ACTIVATE / DEACTIVATE
export async function activateEnrollee(id: string): Promise<EnrolleeDetailResponse> {
  const res = await api.put<EnrolleeDetailResponse>(`/enrollees/${id}/activate`, {});
  return res.data;
}
export async function deactivateEnrollee(id: string): Promise<EnrolleeDetailResponse> {
  const res = await api.put<EnrolleeDetailResponse>(`/enrollees/${id}/deativate`, {});
  return res.data;
}

// CREATE (individual or corporate basic step) - multipart/form-data
export async function createEnrollee(payload: CreateOrUpdateEnrolleePayload): Promise<EnrolleeDetailResponse> {
  const formData = toEnrolleeFormData(payload);
  const res = await api.post<EnrolleeDetailResponse>("/enrollees", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// UPDATE
export async function updateEnrollee(id: string, payload: CreateOrUpdateEnrolleePayload): Promise<EnrolleeDetailResponse> {
  const formData = toEnrolleeFormData({ ...payload, id });
  const res = await api.put<EnrolleeDetailResponse>(`/enrollees/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// UPDATE NEXT OF KIN (partial body, only changed fields expected)
export interface UpdateNextOfKinPayload {
  fullName?: string;
  relationship?: string;
  phoneNumber?: string;
  homeAddress?: string;
  id: string; // nok id
  enrolleeId: string; // parent id
}
export async function updateNextOfKin(enrolleeId: string, nokId: string, payload: UpdateNextOfKinPayload): Promise<EnrolleeDetailResponse> {
  const res = await api.put<EnrolleeDetailResponse>(`/enrollees/${enrolleeId}/next-of-kin/${nokId}`, payload);
  return res.data;
}

// PLAN DETAIL CREATE
export async function createPlanDetail(payload: PlanDetailPayload): Promise<PlanDetailResponse> {
  const res = await api.post<PlanDetailResponse>("/settings/plan-detail", payload);
  return res.data;
}

// SETTINGS LOOKUPS
export async function listEnrolleeClasses(): Promise<NamedListResponse> {
  const res = await api.get<NamedListResponse>("/settings/enrollee-class");
  return res.data;
}

export async function listEnrolleeTypes(): Promise<NamedListResponse> {
  const res = await api.get<NamedListResponse>("/settings/enrollee-type");
  return res.data;
}

export async function listPlanTypes(): Promise<NamedListResponse> {
  const res = await api.get<NamedListResponse>("/settings/plan-types");
  return res.data;
}

// Member Types (alias of enrollee types used in plan detail step)
export async function listMemberTypes(): Promise<NamedListResponse> {
  const res = await api.get<NamedListResponse>("/settings/member-types");
  return res.data;
}

// Resource lookups (simple caching via separate query keys in hooks)
export async function listGenders(): Promise<StringArrayResponse> {
  const res = await api.get<StringArrayResponse>("/resources/genders");
  return res.data;
}
export async function listMaritalStatuses(): Promise<StringArrayResponse> {
  const res = await api.get<StringArrayResponse>("/resources/marital-statuses");
  return res.data;
}
export async function listCountries(): Promise<CountriesResponse> {
  const res = await api.get<CountriesResponse>("/resources/countries");
  return res.data;
}
export async function listStates(): Promise<StatesResponse> {
  const res = await api.get<StatesResponse>("/resources/states/all");
  return res.data;
}
export async function listLgasByState(stateId: string): Promise<LgasResponse> {
  const res = await api.get<LgasResponse>(`/resources/states/${stateId}/lgas`);
  return res.data;
}
export async function listRelationships(): Promise<StringArrayResponse> {
  const res = await api.get<StringArrayResponse>("/resources/relationships");
  return res.data;
}

// DEPENDENTS
export interface DependentPayload {
  EnrolleeId: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  DateOfBirth: string; // ISO
  Photo?: File | string | null;
}

export async function listDependents(enrolleeId: string) {
  const res = await api.get(`/enrollees/${enrolleeId}/dependents`);
  return res.data;
}

export async function createDependent(enrolleeId: string, payload: DependentPayload) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k,v])=> { if(v!==undefined && v!==null) fd.append(k, v as unknown as string | Blob); });
  const res = await api.post(`/enrollees/${enrolleeId}/dependents`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
  return res.data;
}

export async function updateDependent(enrolleeId: string, id: string, payload: Partial<DependentPayload>) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k,v])=> { if(v!==undefined && v!==null) fd.append(k, v as unknown as string | Blob); });
  const res = await api.put(`/enrollees/${enrolleeId}/dependents/${id}`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
  return res.data;
}

// UTIL
function toEnrolleeFormData(payload: CreateOrUpdateEnrolleePayload): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
  fd.append(k, v as string | Blob);
  });
  return fd;
}
