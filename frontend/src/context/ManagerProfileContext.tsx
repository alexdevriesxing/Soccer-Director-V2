import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ManagerProfile = {
  name: string;
  club: string;
};

type ManagerProfileContextType = {
  profile: ManagerProfile | null;
  setProfile: (profile: ManagerProfile | null) => void;
};

const ManagerProfileContext = createContext<ManagerProfileContextType | undefined>(undefined);

export function ManagerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ManagerProfile | null>(() => {
    const saved = localStorage.getItem('soccer-director-profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist profile to localStorage
  React.useEffect(() => {
    if (profile) {
      localStorage.setItem('soccer-director-profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('soccer-director-profile');
    }
  }, [profile]);

  // When setting profile, prevent jong teams from being set as the user's club

  return (
    <ManagerProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ManagerProfileContext.Provider>
  );
}

export function useManagerProfile() {
  const context = useContext(ManagerProfileContext);
  if (!context) throw new Error('useManagerProfile must be used within ManagerProfileProvider');
  return context;
} 