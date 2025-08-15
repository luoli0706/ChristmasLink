import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  adminToken: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:7776'}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.isAdmin) {
        setIsAdmin(true);
        setAdminToken(data.data.token);
        localStorage.setItem('admin_token', data.data.token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('管理员登录失败:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminToken(null);
    localStorage.removeItem('admin_token');
  };

  // 初始化时检查是否已登录
  React.useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken === 'admin_authenticated') {
      setIsAdmin(true);
      setAdminToken(savedToken);
    }
  }, []);

  const value: AdminContextType = {
    isAdmin,
    adminToken,
    login,
    logout,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
