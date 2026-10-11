import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { role } = useApp();
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
