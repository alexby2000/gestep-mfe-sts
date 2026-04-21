import React, { createContext, useContext, useState, useEffect } from 'react';
import { usersService } from '../services/UserInfo/usersService';
import { useAuth } from '@gestep/shared/auth';

const PendingCountContext = createContext({ pendingCount: 0, setPendingCount: () => {} });

export const PendingCountProvider = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    // Esperar a que el silentRefresh termine y haya usuario autenticado
    if (loading || !currentUser) return;
    usersService.getPendingUsers()
      .then(data => setPendingCount(data.length))
      .catch(() => {});
  }, [loading, currentUser]);

  return (
    <PendingCountContext.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </PendingCountContext.Provider>
  );
};

export const usePendingCount = () => useContext(PendingCountContext);
