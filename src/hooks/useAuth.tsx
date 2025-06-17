import React, { useState, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User | null>({
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  });

  const login = async (email: string, password: string) => {
    // Implement actual login logic here
    console.log('Login attempted with:', email, password);
  };

  const logout = () => {
    // Implement logout logic here
    console.log('Logout attempted');
  };

  const value = {
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};