export const CATEGORIES = [
  'Electrical',
  'Wi-Fi',
  'Computer/Lab',
  'Classroom',
  'Projector',
  'Furniture',
  'Cleanliness',
  'Other',
] as const;

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type RequestStatus = (typeof STATUSES)[number];

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  priority: Priority;
  status: RequestStatus;
  resolutionNotes: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestList {
  requests: ServiceRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  critical: number;
}

export interface RequestFilters {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  submittedBy?: string;
  page?: number;
  limit?: number;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  category: Category;
  location: string;
  priority: Priority;
  submittedBy: string;
}

export interface StatusUpdatePayload {
  status: RequestStatus;
  priority?: Priority;
  resolutionNotes?: string;
}
