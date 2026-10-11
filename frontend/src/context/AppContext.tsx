import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Role = 'student' | 'admin';

interface AppState {
  role: Role;
  studentName: string;
  setRole: (role: Role) => void;
  setStudentName: (name: string) => void;
}

const AppContext = createContext<AppState | null>(null);

function readRole(): Role {
  return window.localStorage.getItem('campus-role') === 'admin' ? 'admin' : 'student';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(readRole);
  const [studentName, setStudentName] = useState(
    () => window.localStorage.getItem('campus-student') || 'Aisha Khan',
  );

  useEffect(() => {
    window.localStorage.setItem('campus-role', role);
  }, [role]);

  useEffect(() => {
    window.localStorage.setItem('campus-student', studentName);
  }, [studentName]);

  const value = useMemo(
    () => ({ role, studentName, setRole, setStudentName }),
    [role, studentName],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
