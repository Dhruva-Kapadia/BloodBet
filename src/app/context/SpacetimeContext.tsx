import { createContext, useContext, ReactNode } from 'react';
import { useSpacetime } from '../hooks/useSpacetime';

type SpacetimeContextType = ReturnType<typeof useSpacetime>;

const SpacetimeContext = createContext<SpacetimeContextType | null>(null);

export function SpacetimeProvider({ children }: { children: ReactNode }) {
  const spacetime = useSpacetime();
  return (
    <SpacetimeContext.Provider value={spacetime}>
      {children}
    </SpacetimeContext.Provider>
  );
}

export function useDB() {
  const ctx = useContext(SpacetimeContext);
  if (!ctx) throw new Error('useDB must be used inside SpacetimeProvider');
  return ctx;
}
