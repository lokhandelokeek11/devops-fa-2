import { ClipboardList, LayoutDashboard, PlusCircle, Shield, Wrench } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/requests/new', label: 'New Request', icon: PlusCircle, end: false },
  { to: '/requests', label: 'My Requests', icon: ClipboardList, end: true },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: Shield, end: true },
  { to: '/admin/requests', label: 'Manage Requests', icon: ClipboardList, end: false },
];

function LinkList({
  links,
}: {
  links: { to: string; label: string; icon: typeof Wrench; end: boolean }[];
}) {
  return (
    <div className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-white/10 text-white' : 'text-stone-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {link.label}
          </NavLink>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const { role } = useApp();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#142433] text-white md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="rounded-lg bg-[#c56a1a] p-2 text-white">
          <Wrench size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold">CampusDesk</p>
          <p className="text-xs text-stone-400">Maintenance desk</p>
        </div>
      </div>
      <nav className="flex-1 space-y-6 px-3 pb-6">
        {role === 'admin' ? (
          <div>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Administration
            </p>
            <LinkList links={adminLinks} />
          </div>
        ) : null}
        <div>
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Students
          </p>
          <LinkList links={studentLinks} />
        </div>
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const { role } = useApp();
  const links = role === 'admin' ? [...adminLinks, ...studentLinks] : studentLinks;

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-white px-4 py-2 md:hidden">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
              isActive ? 'bg-[#142433] text-white' : 'bg-stone-100 text-stone-700'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
