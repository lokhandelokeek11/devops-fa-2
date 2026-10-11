import { Link, useNavigate } from 'react-router-dom';
import {
  Monitor,
  PlugZap,
  Projector,
  Sofa,
  Sparkles,
  Wifi,
  Wrench,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../context/AppContext';

const issues = [
  { icon: PlugZap, label: 'Electrical faults' },
  { icon: Wifi, label: 'Wi-Fi outages' },
  { icon: Monitor, label: 'Lab computers' },
  { icon: Projector, label: 'Projectors' },
  { icon: Sofa, label: 'Furniture' },
  { icon: Sparkles, label: 'Cleanliness' },
];

export function LandingPage() {
  const { setRole } = useApp();
  const navigate = useNavigate();

  function openAdminDesk() {
    setRole('admin');
    navigate('/admin');
  }

  return (
    <div className="min-h-screen bg-[#f3f0e9]">
      <Navbar />
      <main>
        <section className="bg-[#142433] text-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1.3fr_0.7fr] md:px-6 md:py-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#e0b07a]">
                Smart Campus Maintenance
              </p>
              <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
                Report a campus problem. Track it until it is fixed.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-stone-300">
                Students raise maintenance requests for classrooms, labs, and hostels.
                Administrators review priority, update status, and record how the issue was resolved.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/requests/new"
                  className="rounded-lg bg-[#c56a1a] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Report an issue
                </Link>
                <button
                  type="button"
                  onClick={openAdminDesk}
                  className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Open admin desk
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center gap-2 text-sm text-stone-300">
                <Wrench size={16} />
                Today on campus
              </div>
              <ul className="space-y-3 text-sm">
                <li className="rounded-xl bg-white/10 px-3 py-3">Critical · Loose socket in Block B</li>
                <li className="rounded-xl bg-white/10 px-3 py-3">In progress · Library Wi-Fi drops</li>
                <li className="rounded-xl bg-white/10 px-3 py-3">Resolved · Replaced seminar chairs</li>
              </ul>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <h2 className="text-2xl font-semibold text-[#142433]">What students can report</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => {
              const Icon = issue.icon;
              return (
                <div key={issue.label} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <Icon className="text-[#c56a1a]" size={20} />
                  <p className="mt-3 font-medium text-[#142433]">{issue.label}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
