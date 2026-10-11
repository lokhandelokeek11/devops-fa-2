import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorMessage } from '../components/ErrorMessage';
import { Input, TextArea } from '../components/Input';
import { Select } from '../components/Select';
import { useApp } from '../context/AppContext';
import { createRequest } from '../services/requestService';
import { CATEGORIES, PRIORITIES, type Category, type Priority } from '../types';

export function CreateRequestPage() {
  const navigate = useNavigate();
  const { studentName } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Electrical');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await createRequest({
        title,
        description,
        category,
        location,
        priority,
        submittedBy: studentName.trim(),
      });
      navigate(`/requests/${created.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create the request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#142433]">Create Request</h1>
        <p className="mt-1 text-sm text-stone-600">
          New requests start as Pending. Include the room or area so facilities can find it.
        </p>
      </div>
      <Card className="p-5">
        <form data-testid="request-form" className="space-y-4" onSubmit={onSubmit}>
          {error ? <ErrorMessage message={error} /> : null}
          <Input id="title" label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={120} />
          <TextArea
            id="description"
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            minLength={10}
            maxLength={2000}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select id="category" label="Category" value={category} options={CATEGORIES} onChange={(event) => setCategory(event.target.value as Category)} />
            <Select id="priority" label="Priority" value={priority} options={PRIORITIES} onChange={(event) => setPriority(event.target.value as Priority)} />
          </div>
          <Input
            id="location"
            label="Location"
            placeholder="Block A - Room 204"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
            minLength={2}
            maxLength={120}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit request'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
