import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { Card } from './Card';
import type { ServiceRequest } from '../types';
import { formatDate } from '../utils/format';

export function RequestCard({ request }: { request: ServiceRequest }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to={`/requests/${request.id}`}
            className="text-base font-semibold text-[#142433] hover:text-[#c56a1a]"
          >
            {request.title}
          </Link>
          <p className="mt-1 text-sm text-stone-500">
            {request.location} · {request.category}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge value={request.status} />
          <Badge value={request.priority} />
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-stone-700">{request.description}</p>
      <p className="mt-3 text-xs text-stone-500">
        {request.submittedBy || 'Student'} · {formatDate(request.createdAt)}
      </p>
    </Card>
  );
}
