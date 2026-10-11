import { randomUUID } from 'crypto';
import type { QueryResultRow } from 'pg';
import { getDatabase } from '../config/db';
import { ApiError } from '../utils/ApiError';
import type { CreateRequestInput, ListQuery, StatusUpdateInput, UpdateRequestInput } from '../utils/validators';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface RequestRow extends QueryResultRow {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  resolution_notes: string;
  submitted_by: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  resolutionNotes: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
}

function assertUuid(id: string): void {
  if (!UUID_PATTERN.test(id)) {
    throw new ApiError(400, 'Invalid request id', 'id must be a valid identifier');
  }
}

function toIso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

function toRequest(row: RequestRow): ServiceRequest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    priority: row.priority,
    status: row.status,
    resolutionNotes: row.resolution_notes,
    submittedBy: row.submitted_by,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function createRequest(input: CreateRequestInput): Promise<ServiceRequest> {
  const result = await getDatabase().query<RequestRow>(
    `INSERT INTO requests
      (id, title, description, category, location, priority, status, resolution_notes, submitted_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'Pending', '', $7)
     RETURNING *`,
    [randomUUID(), input.title, input.description, input.category, input.location, input.priority, input.submittedBy],
  );
  return toRequest(result.rows[0]);
}

export async function listRequests(query: ListQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
  const conditions: string[] = [];
  const values: unknown[] = [];

  const add = (column: string, value: string): void => {
    values.push(value);
    conditions.push(`${column} = $${values.length}`);
  };

  if (query.status) {
    add('status', query.status);
  }
  if (query.priority) {
    add('priority', query.priority);
  }
  if (query.category) {
    add('category', query.category);
  }
  if (query.submittedBy) {
    add('submitted_by', query.submittedBy);
  }
  if (query.search) {
    values.push(`%${escapeLike(query.search)}%`);
    const placeholder = `$${values.length}`;
    conditions.push(
      `(title ILIKE ${placeholder} ESCAPE '\\' OR description ILIKE ${placeholder} ESCAPE '\\' OR location ILIKE ${placeholder} ESCAPE '\\')`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const listValues = [...values, limit, (page - 1) * limit];
  const [rows, count] = await Promise.all([
    getDatabase().query<RequestRow>(
      `SELECT * FROM requests ${where} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      listValues,
    ),
    getDatabase().query<{ count: string }>(`SELECT COUNT(*) AS count FROM requests ${where}`, values),
  ]);

  return {
    requests: rows.rows.map(toRequest),
    total: Number(count.rows[0]?.count ?? 0),
    page,
    limit,
  };
}

export async function getRequestById(id: string): Promise<ServiceRequest> {
  assertUuid(id);
  const result = await getDatabase().query<RequestRow>('SELECT * FROM requests WHERE id = $1', [id]);
  const row = result.rows[0];
  if (!row) {
    throw new ApiError(404, 'Request not found', 'Not Found');
  }
  return toRequest(row);
}

export async function updateRequest(id: string, input: UpdateRequestInput): Promise<ServiceRequest> {
  assertUuid(id);
  const assignments: string[] = [];
  const values: unknown[] = [];

  const assign = (column: string, value: string): void => {
    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  };

  if (input.title !== undefined) {
    assign('title', input.title);
  }
  if (input.description !== undefined) {
    assign('description', input.description);
  }
  if (input.category !== undefined) {
    assign('category', input.category);
  }
  if (input.location !== undefined) {
    assign('location', input.location);
  }
  if (input.priority !== undefined) {
    assign('priority', input.priority);
  }

  values.push(id);
  const result = await getDatabase().query<RequestRow>(
    `UPDATE requests SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values,
  );
  const row = result.rows[0];
  if (!row) {
    throw new ApiError(404, 'Request not found', 'Not Found');
  }
  return toRequest(row);
}

export async function updateRequestStatus(id: string, input: StatusUpdateInput): Promise<ServiceRequest> {
  assertUuid(id);
  const assignments = ['status = $1'];
  const values: unknown[] = [input.status];

  if (input.priority) {
    values.push(input.priority);
    assignments.push(`priority = $${values.length}`);
  }
  if (input.resolutionNotes !== undefined) {
    values.push(input.resolutionNotes);
    assignments.push(`resolution_notes = $${values.length}`);
  }

  values.push(id);
  const result = await getDatabase().query<RequestRow>(
    `UPDATE requests SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values,
  );
  const row = result.rows[0];
  if (!row) {
    throw new ApiError(404, 'Request not found', 'Not Found');
  }
  return toRequest(row);
}

export async function deleteRequest(id: string): Promise<void> {
  assertUuid(id);
  const result = await getDatabase().query('DELETE FROM requests WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    throw new ApiError(404, 'Request not found', 'Not Found');
  }
}

export async function getAdminStats() {
  const result = await getDatabase().query<{
    total: string;
    pending: string;
    in_progress: string;
    resolved: string;
    rejected: string;
    critical: string;
  }>(
    `SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
      COUNT(*) FILTER (WHERE status = 'In Progress') AS in_progress,
      COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved,
      COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected,
      COUNT(*) FILTER (WHERE priority = 'Critical') AS critical
    FROM requests`,
  );
  const row = result.rows[0];
  return {
    total: Number(row?.total ?? 0),
    pending: Number(row?.pending ?? 0),
    inProgress: Number(row?.in_progress ?? 0),
    resolved: Number(row?.resolved ?? 0),
    rejected: Number(row?.rejected ?? 0),
    critical: Number(row?.critical ?? 0),
  };
}
