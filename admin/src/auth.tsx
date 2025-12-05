import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  token: string;
  apiBase: string;
  wsBase: string;
  setToken: (value: string) => void;
  setApiBase: (value: string) => void;
  setWsBase: (value: string) => void;
}

const defaultApiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const defaultWsBase = import.meta.env.VITE_WS_BASE || 'ws://localhost:3000/ws/events';

const AuthContext = createContext<AuthContextValue>({
  token: '',
  apiBase: defaultApiBase,
  wsBase: defaultWsBase,
  setToken: () => undefined,
  setApiBase: () => undefined,
  setWsBase: () => undefined,
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('keylog-token') || '');
  const [apiBase, setApiBase] = useState<string>(() => localStorage.getItem('keylog-api-base') || defaultApiBase);
  const [wsBase, setWsBase] = useState<string>(() => localStorage.getItem('keylog-ws-base') || defaultWsBase);

  useEffect(() => {
    localStorage.setItem('keylog-token', token);
  }, [token]);

  useEffect(() => {
    localStorage.setItem('keylog-api-base', apiBase);
  }, [apiBase]);

  useEffect(() => {
    localStorage.setItem('keylog-ws-base', wsBase);
  }, [wsBase]);

  return (
    <AuthContext.Provider value={{ token, apiBase, wsBase, setToken, setApiBase, setWsBase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
