import { api } from './api';
import type {
  AdminStats,
  CreateRequestPayload,
  RequestFilters,
  RequestList,
  ServiceRequest,
  StatusUpdatePayload,
} from '../types';

interface ApiSuccess<T> {
  success: boolean;
  message: string;
  data: T;
}

function cleanParams(filters: RequestFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  (Object.entries(filters) as [string, string | number | undefined][]).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params[key] = value;
    }
  });
  return params;
}

export async function getRequests(filters: RequestFilters = {}): Promise<RequestList> {
  const response = await api.get<ApiSuccess<RequestList>>('/api/requests', {
    params: cleanParams(filters),
  });
  return response.data.data;
}

export async function getRequest(id: string): Promise<ServiceRequest> {
  const response = await api.get<ApiSuccess<ServiceRequest>>(`/api/requests/${id}`);
  return response.data.data;
}

export async function createRequest(payload: CreateRequestPayload): Promise<ServiceRequest> {
  const response = await api.post<ApiSuccess<ServiceRequest>>('/api/requests', payload);
  return response.data.data;
}

export async function updateRequest(
  id: string,
  payload: Partial<CreateRequestPayload>,
): Promise<ServiceRequest> {
  const response = await api.put<ApiSuccess<ServiceRequest>>(`/api/requests/${id}`, payload);
  return response.data.data;
}

export async function deleteRequest(id: string): Promise<void> {
  await api.delete(`/api/requests/${id}`);
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await api.get<ApiSuccess<AdminStats>>('/api/admin/stats');
  return response.data.data;
}

export async function updateRequestStatus(
  id: string,
  payload: StatusUpdatePayload,
): Promise<ServiceRequest> {
  const response = await api.patch<ApiSuccess<ServiceRequest>>(
    `/api/admin/requests/${id}/status`,
    payload,
  );
  return response.data.data;
}
