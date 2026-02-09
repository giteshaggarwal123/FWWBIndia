import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

const STORAGE_KEY = 'fwwb-selected-program';

type ProgramFilterContextValue = {
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
};

const ProgramFilterContext = createContext<ProgramFilterContextValue | null>(null);

export function ProgramFilterProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      if (selectedProjectId) localStorage.setItem(STORAGE_KEY, selectedProjectId);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [selectedProjectId]);

  const setSelectedProjectId = useCallback((id: string) => {
    setState(id || '');
  }, []);

  return (
    <ProgramFilterContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </ProgramFilterContext.Provider>
  );
}

export function useProgramFilter() {
  const ctx = useContext(ProgramFilterContext);
  return ctx ?? { selectedProjectId: '', setSelectedProjectId: () => {} };
}

/** Paths under Program Management that show data filtered by program (not Programs or Partners list). */
export const PROGRAM_FILTER_PATHS = [
  '/activities',
  '/form-builder',
  '/monitoring',
  '/budget',
  '/expenses',
  '/reports',
  '/lfa',
  '/beneficiaries',
  '/documents',
];

export function useShowProgramFilter() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  return PROGRAM_FILTER_PATHS.some((p) => path === p || path.startsWith(p + '/'));
}
