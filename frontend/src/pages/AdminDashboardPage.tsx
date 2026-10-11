import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, Clock3, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RequestCard } from '../components/RequestCard';
import { StatCard } from '../components/StatCard';
import { getAdminStats, getRequests } from '../services/requestService';
import type { AdminStats, ServiceRequest } from '../types';

const emptyStats: AdminStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
  rejected: 0,
  critical: 0,
};

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [criticalRequests, setCriticalRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getAdminStats(), getRequests({ priority: 'Critical', limit: 5 })])
      .then(([nextStats, list]) => {
        if (!active) {
          return;
        }
        setStats(nextStats);
        setCriticalRequests(list.requests);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Unable to load the admin desk');
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
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#142433]">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-stone-600">
            Campus maintenance queue at a glance.
            {loading ? '' : ` ${stats.rejected} rejected.`}
          </p>
        </div>
        <Link to="/admin/requests" className="text-sm font-semibold text-[#c56a1a]">
          Manage all requests
        </Link>
      </div>
      {error ? <ErrorMessage message={error} /> : null}
      {loading ? <LoadingSpinner label="Loading statistics" /> : null}
      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total Requests" value={stats.total} icon={<ClipboardList size={20} />} tone="bg-stone-100 text-stone-700" />
            <StatCard label="Pending Requests" value={stats.pending} icon={<Clock3 size={20} />} tone="bg-amber-100 text-amber-800" />
            <StatCard label="In Progress Requests" value={stats.inProgress} icon={<AlertTriangle size={20} />} tone="bg-sky-100 text-sky-800" />
            <StatCard label="Resolved Requests" value={stats.resolved} icon={<CheckCircle2 size={20} />} tone="bg-emerald-100 text-emerald-800" />
            <StatCard label="Critical Requests" value={stats.critical} icon={<Siren size={20} />} tone="bg-red-100 text-red-800" />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-[#142433]">Critical queue</h2>
            {criticalRequests.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-8 text-sm text-stone-600">
                No critical requests right now.
              </p>
            ) : (
              criticalRequests.map((request) => <RequestCard key={request.id} request={request} />)
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
