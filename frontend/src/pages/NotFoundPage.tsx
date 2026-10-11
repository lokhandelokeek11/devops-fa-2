import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold text-[#142433]">Page not found</h1>
      <p className="mt-2 text-sm text-stone-600">That route is not part of CampusDesk.</p>
      <Link to="/" className="mt-4 inline-block text-sm font-semibold text-[#c56a1a]">
        Go home
      </Link>
    </div>
  );
}
