import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listEnrollees,
  getEnrollee,
  createEnrollee,
  updateEnrollee,
  createPlanDetail,
  listEnrolleeClasses,
  listEnrolleeTypes,
  listPlanTypes,
  listMemberTypes,
  listGenders,
  listMaritalStatuses,
  listCountries,
  listStates,
  listLgasByState,
  listRelationships,
  activateEnrollee,
  deactivateEnrollee,
  updateNextOfKin,
  listDependents,
  createDependent,
  updateDependent,
} from "./api";
import type { EnrolleeListParams, CreateOrUpdateEnrolleePayload, EnrolleeListResponse } from "../../types/enrollee";

// KEYS
const baseKey = ["enrollees"] as const;
export const enrolleeKeys = {
  all: baseKey,
  list: (params?: Partial<EnrolleeListParams>) => [...baseKey, "list", params] as const,
  detail: (id: string) => [...baseKey, "detail", id] as const,
  classes: () => [...baseKey, "classes"] as const,
  types: () => [...baseKey, "types"] as const,
  planDetail: () => [...baseKey, "plan-detail"] as const,
  genders: () => [...baseKey, "genders"] as const,
  maritalStatuses: () => [...baseKey, "marital-statuses"] as const,
  countries: () => [...baseKey, "countries"] as const,
  states: () => [...baseKey, "states"] as const,
  lgas: (stateId: string | undefined) => [...baseKey, "lgas", stateId] as const,
  relationships: () => [...baseKey, "relationships"] as const,
  memberTypes: () => [...baseKey, "member-types"] as const,
  planTypes: () => [...baseKey, "plan-types"] as const,
  dependents: (enrolleeId: string) => [...baseKey, "dependents", enrolleeId] as const,
};

export function useEnrollees(params: EnrolleeListParams | undefined, enabled = true) {
  return useQuery<EnrolleeListResponse>({
    queryKey: enrolleeKeys.list(params),
    queryFn: () => {
      if (!params) throw new Error("Missing params");
      return listEnrollees(params);
    },
    enabled: Boolean(enabled && params?.HMOId),
  });
}

export function useEnrollee(id: string | undefined) {
  return useQuery({
    queryKey: id ? enrolleeKeys.detail(id) : ["enrollee", "detail", null],
    queryFn: () => {
      if (!id) throw new Error("Missing id");
      return getEnrollee(id);
    },
    enabled: Boolean(id),
  });
}

export function useCreateEnrollee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEnrollee,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrolleeKeys.all });
    }
  });
}

export function useUpdateEnrollee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrUpdateEnrolleePayload) => updateEnrollee(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrolleeKeys.detail(id) });
    }
  });
}

export function useCreatePlanDetail() {
  return useMutation({ mutationFn: createPlanDetail });
}

export function useEnrolleeClasses() {
  return useQuery({ queryKey: enrolleeKeys.classes(), queryFn: listEnrolleeClasses });
}

export function useEnrolleeTypes() {
  return useQuery({ queryKey: enrolleeKeys.types(), queryFn: listEnrolleeTypes });
}

export function usePlanTypes() {
  return useQuery({
    queryKey: enrolleeKeys.planTypes(),
    queryFn: listPlanTypes,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 6, // keep for 6 hours in cache
  });
}

export function useMemberTypes() {
  return useQuery({ queryKey: enrolleeKeys.memberTypes(), queryFn: listMemberTypes });
}

export function useGenders() {
  return useQuery({ queryKey: enrolleeKeys.genders(), queryFn: listGenders });
}
export function useMaritalStatuses() {
  return useQuery({ queryKey: enrolleeKeys.maritalStatuses(), queryFn: listMaritalStatuses });
}
export function useCountries() {
  return useQuery({ queryKey: enrolleeKeys.countries(), queryFn: listCountries });
}
export function useStates() {
  return useQuery({ queryKey: enrolleeKeys.states(), queryFn: listStates });
}
export function useLgas(stateId: string | undefined) {
  return useQuery({
    queryKey: enrolleeKeys.lgas(stateId),
    queryFn: () => {
      if (!stateId) throw new Error("Missing stateId");
      return listLgasByState(stateId);
    },
    enabled: Boolean(stateId),
  });
}
export function useRelationships() {
  return useQuery({ queryKey: enrolleeKeys.relationships(), queryFn: listRelationships });
}

export function useActivateEnrollee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => activateEnrollee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrolleeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: enrolleeKeys.all });
    }
  });
}

export function useDeactivateEnrollee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deactivateEnrollee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrolleeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: enrolleeKeys.all });
    }
  });
}

export function useUpdateNextOfKin(enrolleeId: string, nokId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateNextOfKin>[2]) => updateNextOfKin(enrolleeId, nokId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrolleeKeys.detail(enrolleeId) });
    }
  });
}

// DEPENDENTS
export function useDependents(enrolleeId: string | undefined) {
  return useQuery({
    queryKey: enrolleeId ? enrolleeKeys.dependents(enrolleeId) : ["dependents","none"],
    queryFn: () => {
      if(!enrolleeId) throw new Error('Missing enrolleeId');
      return listDependents(enrolleeId);
    },
    enabled: !!enrolleeId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateDependent(enrolleeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createDependent>[1]) => createDependent(enrolleeId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrolleeKeys.dependents(enrolleeId) });
      qc.invalidateQueries({ queryKey: enrolleeKeys.detail(enrolleeId) });
    }
  });
}

export function useUpdateDependent(enrolleeId: string, depId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateDependent>[2]) => updateDependent(enrolleeId, depId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrolleeKeys.dependents(enrolleeId) });
      qc.invalidateQueries({ queryKey: enrolleeKeys.detail(enrolleeId) });
    }
  });
}
