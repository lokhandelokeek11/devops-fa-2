import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorMessage } from '../components/ErrorMessage';
import { Input, TextArea } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { useDebounce } from '../hooks/useDebounce';
import { useRequests } from '../hooks/useRequests';
import { deleteRequest, updateRequestStatus } from '../services/requestService';
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  type Priority,
  type RequestStatus,
  type ServiceRequest,
} from '../types';
import { formatDate } from '../utils/format';

export function AdminRequestsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { requests, total, loading, error, reload } = useRequests({
    search: debouncedSearch,
    status,
    priority,
    category,
    limit: 50,
  });

  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [nextStatus, setNextStatus] = useState<RequestStatus>('Pending');
  const [nextPriority, setNextPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');
  const [pendingDelete, setPendingDelete] = useState<ServiceRequest | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openUpdate(request: ServiceRequest) {
    setSelected(request);
    setNextStatus(request.status);
    setNextPriority(request.priority);
    setNotes(request.resolutionNotes);
    setActionError(null);
  }

  async function saveUpdate(event: FormEvent) {
    event.preventDefault();
    if (!selected) {
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      await updateRequestStatus(selected.id, {
        status: nextStatus,
        priority: nextPriority,
        resolutionNotes: notes,
      });
      setSelected(null);
      await reload();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      await deleteRequest(pendingDelete.id);
      setPendingDelete(null);
      await reload();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#142433]">Manage Requests</h1>
        <p className="mt-1 text-sm text-stone-600">{total} matching requests.</p>
      </div>
      <Card className="grid gap-3 p-4 md:grid-cols-4">
        <Input id="search" label="Search" value={search} placeholder="Title, room, or description" onChange={(event) => setSearch(event.target.value)} />
        <Select id="filter-status" label="Status" value={status} options={STATUSES} allowEmpty onChange={(event) => setStatus(event.target.value)} />
        <Select id="filter-priority" label="Priority" value={priority} options={PRIORITIES} allowEmpty onChange={(event) => setPriority(event.target.value)} />
        <Select id="filter-category" label="Category" value={category} options={CATEGORIES} allowEmpty onChange={(event) => setCategory(event.target.value)} />
      </Card>
      {error ? <ErrorMessage message={error} /> : null}
      {actionError && !selected ? <ErrorMessage message={actionError} /> : null}
      {loading ? <LoadingSpinner /> : null}
      {!loading ? (
        <Card>
          <Table headers={['Request', 'Category', 'Priority', 'Status', 'Opened', 'Actions']}>
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-4 py-3">
                  <Link to={`/requests/${request.id}`} className="font-medium text-[#142433] hover:text-[#c56a1a]">
                    {request.title}
                  </Link>
                  <p className="text-xs text-stone-500">{request.location}</p>
                </td>
                <td className="px-4 py-3">{request.category}</td>
                <td className="px-4 py-3">
                  <Badge value={request.priority} />
                </td>
                <td className="px-4 py-3">
                  <Badge value={request.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(request.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => openUpdate(request)}>
                      Update
                    </Button>
                    <Button variant="danger" onClick={() => setPendingDelete(request)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
          {requests.length === 0 ? (
            <p className="px-4 py-8 text-sm text-stone-600">No requests match these filters.</p>
          ) : null}
        </Card>
      ) : null}

      <Modal title="Update request" open={Boolean(selected)} onClose={() => setSelected(null)}>
        <form className="space-y-4" onSubmit={saveUpdate}>
          {actionError ? <ErrorMessage message={actionError} /> : null}
          <Select id="modal-status" label="Status" value={nextStatus} options={STATUSES} onChange={(event) => setNextStatus(event.target.value as RequestStatus)} />
          <Select id="modal-priority" label="Priority" value={nextPriority} options={PRIORITIES} onChange={(event) => setNextPriority(event.target.value as Priority)} />
          <TextArea id="modal-notes" label="Resolution notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="Delete request" open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <p className="text-sm text-stone-700">
          Delete “{pendingDelete?.title}”? This removes the maintenance record.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={saving} onClick={() => void confirmDelete()}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
