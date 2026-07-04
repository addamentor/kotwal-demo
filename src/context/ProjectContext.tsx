/**
 * ProjectContext — tiny client-side context that backs the ProjectSwitcher.
 *
 * The demo has no server-side notion of a "current project" — the switcher
 * exists to demonstrate the feature. Selecting a project is remembered in
 * localStorage so it survives reloads within the demo session.
 */
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { MOCK_PROJECTS, DemoProject } from '@/lib/mockData';

const STORAGE_KEY = 'kotwal_demo_active_project_v1';

interface ProjectContextValue {
  projects: DemoProject[];
  activeProjectId: string | null;
  activeProject: DemoProject | null;
  setActiveProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    if (activeProjectId) localStorage.setItem(STORAGE_KEY, activeProjectId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [activeProjectId]);

  const value = useMemo<ProjectContextValue>(() => ({
    projects: MOCK_PROJECTS,
    activeProjectId,
    activeProject: MOCK_PROJECTS.find((p) => p.id === activeProjectId) ?? null,
    setActiveProjectId: setActiveProjectIdState,
  }), [activeProjectId]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider');
  return ctx;
};
