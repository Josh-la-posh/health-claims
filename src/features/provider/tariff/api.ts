import { api } from '../../../lib/axios';

export interface TariffItem {
  service: string;
  descriptions: string;
  code: string;
  price: number;
  providerId: string;
  id: string;
  isActive: boolean;
  createdDate: string; // ISO
}

export interface TariffListResponse { data: TariffItem[]; message?: string; isSuccess: boolean; }

export async function listTariffs(providerId: string, hmoId: string, pageNumber = 1, pageSize = 20): Promise<TariffListResponse> {
  // Endpoint pattern provided: /tariff/providers?${providerId}/hmos/${hmoId}
  // Assuming corrected path should be /tariff/providers/{providerId}/hmos/{hmoId}
  const url = `/tariff/providers/${providerId}/hmos/${hmoId}`;
  const res = await api.get<TariffListResponse>(url, { params: { PageNumber: pageNumber, PageSize: pageSize } });
  return res.data;
}
