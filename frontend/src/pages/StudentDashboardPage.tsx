import { AlertTriangle, CheckCircle2, ClipboardList, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RequestCard } from '../components/RequestCard';
import { StatCard } from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { useRequests } from '../hooks/useRequests';

export function StudentDashboardPage() {
  const { studentName } = useApp();
  const { requests, total, loading, error } = useRequests({
    submittedBy: studentName.trim(),
    limit: 50,
  });

  const pending = requests.filter((request) => request.status === 'Pending').length;
  const inProgress = requests.filter((request) => request.status === 'In Progress').length;
  const resolved = requests.filter((request) => request.status === 'Resolved').length;

  return (
    <div data-testid="student-dashboard" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#142433]">Student Dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">
            Requests submitted as {studentName.trim() || 'a student'}.
          </p>
        </div>
        <Link to="/requests/new">
          <Button>New request</Button>
        </Link>
      </div>

      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <LoadingSpinner label="Loading your requests" /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="My requests" value={total} icon={<ClipboardList size={20} />} tone="bg-stone-100 text-stone-700" />
            <StatCard label="Pending" value={pending} icon={<Clock3 size={20} />} tone="bg-amber-100 text-amber-800" />
            <StatCard label="In progress" value={inProgress} icon={<AlertTriangle size={20} />} tone="bg-sky-100 text-sky-800" />
            <StatCard label="Resolved" value={resolved} icon={<CheckCircle2 size={20} />} tone="bg-emerald-100 text-emerald-800" />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[#142433]">Recent requests</h2>
            {requests.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8 text-sm text-stone-600">
                No requests yet. Report a classroom, lab, or hostel issue to get started.
              </p>
            ) : (
              requests.slice(0, 5).map((request) => <RequestCard key={request.id} request={request} />)
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
