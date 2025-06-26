import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import type { AuthContextType, User, RegisterData } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем токен при загрузке приложения
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const response = await authService.verifyToken();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Токен недействителен, очищаем localStorage
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success("Вход выполнен успешно!");
      } else {
        throw new Error(response.error || "Ошибка входа");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка входа";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);

      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success("Регистрация прошла успешно!");
      } else {
        throw new Error(response.error || "Ошибка регистрации");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка регистрации";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Вы вышли из системы");
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
