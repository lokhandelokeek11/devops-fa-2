import { useCallback, useEffect, useState } from 'react';
import { getRequests } from '../services/requestService';
import type { RequestFilters, ServiceRequest } from '../types';

export function useRequests(filters: RequestFilters) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filterKey = JSON.stringify(filters);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRequests(JSON.parse(filterKey) as RequestFilters);
      setRequests(result.requests);
      setTotal(result.total);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load requests');
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { requests, total, loading, error, reload };
}
