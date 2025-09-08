import React, { createContext, useContext, useState, useEffect } from "react";

// Types for future auth implementation
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Mock user for development (will be replaced with real auth)
const MOCK_USER: User = {
  id: "mock-user-1",
  email: "usuario@ejemplo.com",
  name: "Usuario Demo",
  avatar: undefined,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Mock authentication - simulate checking for existing session
  useEffect(() => {
    const initAuth = async () => {
      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For now, always "authenticate" the mock user
      // In the future, this would check for stored tokens, validate with server, etc.
      setAuthState({
        user: MOCK_USER,
        isAuthenticated: true,
        isLoading: false,
      });
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    // Mock login - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In the future, this would make a real API call
    setAuthState({
      user: { ...MOCK_USER, email },
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    // Mock logout - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In the future, this would clear tokens, call logout endpoint, etc.
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const register = async (email: string, password: string, name: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    // Mock registration - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In the future, this would make a real API call
    setAuthState({
      user: { ...MOCK_USER, email, name },
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
