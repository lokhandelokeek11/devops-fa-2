import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RequestCard } from '../components/RequestCard';
import { useApp } from '../context/AppContext';
import { useRequests } from '../hooks/useRequests';

export function MyRequestsPage() {
  const { studentName } = useApp();
  const { requests, total, loading, error } = useRequests({
    submittedBy: studentName.trim(),
    limit: 50,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[#142433]">My Requests</h1>
        <p className="mt-1 text-sm text-stone-600">
          {total} request{total === 1 ? '' : 's'} for {studentName.trim() || 'this student'}.
        </p>
      </div>
      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <LoadingSpinner /> : null}
      {!loading && !error && requests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8 text-sm text-stone-600">
          You have not submitted any requests under this name.
        </p>
      ) : null}
      <div className="space-y-3">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
