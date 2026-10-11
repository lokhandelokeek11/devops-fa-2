import { Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Navbar() {
  const { role, setRole, studentName, setStudentName } = useApp();
  const navigate = useNavigate();

  function switchRole(next: 'student' | 'admin') {
    setRole(next);
    navigate(next === 'admin' ? '/admin' : '/dashboard');
  }

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-[#142433]">
          <span className="rounded-lg bg-[#142433] p-2 text-white">
            <Wrench size={16} />
          </span>
          <span className="font-semibold">CampusDesk</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-stone-600">
            Student
            <input
              aria-label="Student name"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              className="w-36 rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-900"
            />
          </label>
          <div className="rounded-lg bg-stone-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => switchRole('student')}
              className={`rounded-md px-3 py-1.5 font-medium ${
                role === 'student' ? 'bg-[#142433] text-white' : 'text-stone-600'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => switchRole('admin')}
              className={`rounded-md px-3 py-1.5 font-medium ${
                role === 'admin' ? 'bg-[#142433] text-white' : 'text-stone-600'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
