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
