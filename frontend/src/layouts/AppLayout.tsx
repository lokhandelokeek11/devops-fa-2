import { Outlet } from 'react-router-dom';
import { MobileNav, Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f3f0e9]">
      <Navbar />
      <div className="flex min-h-[calc(100vh-61px)]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <MobileNav />
          <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
