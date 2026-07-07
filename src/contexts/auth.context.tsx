"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { LoginRequest, UserProfile } from "@/api/types";
import { authService } from "@/services/identification/auth.service";
import { profileService } from "@/services/identification/profile.service";

type AuthState = {
  user:            UserProfile | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login:       (data: LoginRequest) => Promise<void>;
  logout:      () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:            null,
    isLoading:       true,
    isAuthenticated: false,
  });

  // Tenta buscar o perfil — se o cookie HttpOnly for válido, retorna 200.
  // Se inválido ou ausente, o proxy já trata o 401 e http-client redireciona.
  // Aqui apenas capturamos o erro para atualizar o estado local.
  const refreshUser = useCallback(async () => {
    try {
      const user = await profileService.getMe();
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authService.login(data);
    // Se o backend retornou o perfil embutido, usa-o diretamente.
    const user = res.user ?? (await profileService.getMe());
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
