import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorMessage } from '../components/ErrorMessage';
import { TextArea } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Select } from '../components/Select';
import { useApp } from '../context/AppContext';
import { getRequest, updateRequestStatus } from '../services/requestService';
import { PRIORITIES, STATUSES, type Priority, type RequestStatus, type ServiceRequest } from '../types';
import { formatDate } from '../utils/format';

export function RequestDetailsPage() {
  const { id } = useParams();
  const { role } = useApp();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<RequestStatus>('Pending');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    let active = true;
    setLoading(true);
    getRequest(id)
      .then((data) => {
        if (!active) {
          return;
        }
        setRequest(data);
        setStatus(data.status);
        setPriority(data.priority);
        setNotes(data.resolutionNotes);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Unable to load this request');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!request) {
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateRequestStatus(request.id, {
        status,
        priority,
        resolutionNotes: notes,
      });
      setRequest(updated);
      setNotice('Request updated.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading request" />;
  }

  if (error && !request) {
    return <ErrorMessage message={error} />;
  }

  if (!request) {
    return <ErrorMessage message="Request not found" />;
  }

  return (
    <div className="space-y-4">
      <Link to="/requests" className="text-sm font-medium text-[#c56a1a]">
        Back to requests
      </Link>
      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#142433]">{request.title}</h1>
            <p className="mt-1 text-sm text-stone-500">
              {request.location} · {request.category}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge value={request.status} />
            <Badge value={request.priority} />
          </div>
        </div>
        <p className="text-sm leading-6 text-stone-700">{request.description}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">Submitted by</dt>
            <dd className="font-medium">{request.submittedBy || 'Student'}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Opened</dt>
            <dd className="font-medium">{formatDate(request.createdAt)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-stone-500">Resolution notes</dt>
            <dd className="font-medium">{request.resolutionNotes || 'No notes yet.'}</dd>
          </div>
        </dl>
      </Card>

      {role === 'admin' ? (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-[#142433]">Update this request</h2>
          <form className="mt-4 space-y-4" onSubmit={onSave}>
            {error ? <ErrorMessage message={error} /> : null}
            {notice ? <p className="text-sm text-emerald-800">{notice}</p> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Select id="status" label="Status" value={status} options={STATUSES} onChange={(event) => setStatus(event.target.value as RequestStatus)} />
              <Select id="detail-priority" label="Priority" value={priority} options={PRIORITIES} onChange={(event) => setPriority(event.target.value as Priority)} />
            </div>
            <TextArea id="notes" label="Resolution notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save update'}
            </Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
