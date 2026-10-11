import { z } from 'zod';
import { CATEGORIES, PRIORITIES, STATUSES } from './constants';

const emptyToUndefined = (value: unknown): unknown => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

export const createRequestSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000),
  category: z.enum(CATEGORIES),
  location: z.string().trim().min(2, 'Location is required').max(120),
  priority: z.enum(PRIORITIES),
  submittedBy: z.string().trim().max(80).optional().default(''),
});

export const updateRequestSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().min(10).max(2000).optional(),
    category: z.enum(CATEGORIES).optional(),
    location: z.string().trim().min(2).max(120).optional(),
    priority: z.enum(PRIORITIES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const statusUpdateSchema = z.object({
  status: z.enum(STATUSES),
  priority: z.enum(PRIORITIES).optional(),
  resolutionNotes: z.string().trim().max(2000).optional(),
});

export const listQuerySchema = z.object({
  status: z.preprocess(emptyToUndefined, z.enum(STATUSES).optional()),
  priority: z.preprocess(emptyToUndefined, z.enum(PRIORITIES).optional()),
  category: z.preprocess(emptyToUndefined, z.enum(CATEGORIES).optional()),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  submittedBy: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(100).optional()),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
