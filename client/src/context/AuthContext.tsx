import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { toast } from 'sonner';

interface AuthContextType {
  isAdmin: boolean;
  token: string | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  token: null,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('devkeep_admin_token'));
  const [isAdmin, setIsAdmin] = useState<boolean>(() => !!sessionStorage.getItem('devkeep_admin_token'));

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['X-Admin-Token'] = token;
      sessionStorage.setItem('devkeep_admin_token', token);
      setIsAdmin(true);
    } else {
      delete apiClient.defaults.headers.common['X-Admin-Token'];
      sessionStorage.removeItem('devkeep_admin_token');
      setIsAdmin(false);
    }
  }, [token]);

  const login = async (pin: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/login', { pin });
      if (response.data?.token) {
        setToken(response.data.token);
        toast.success('Modo Administrador activado. Permisos de edición habilitados.');
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'PIN de administrador incorrecto';
      toast.error(msg);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    toast.info('Sesión cerrada. Modo Lectura activado.');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
