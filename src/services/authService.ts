import { apiService } from "./apiService";
import type { ApiResponse } from "./apiService";
import { API_ENDPOINTS } from "../config/api";
import { demoApiService } from "./demoApiService";
import type { User, LoginData, RegisterData } from "../types";

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  async login(credentials: LoginData): Promise<ApiResponse<AuthResponse>> {
    try {
      if (this.isDemoMode) {
        const result = await demoApiService.login(
          credentials.email,
          credentials.password
        );
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        return { success: true, data: result };
      }

      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        const result = await demoApiService.login(
          credentials.email,
          credentials.password
        );
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        return { success: true, data: result };
      } catch (demoError) {
        return {
          success: false,
          error:
            demoError instanceof Error ? demoError.message : "Ошибка входа",
        };
      }
    }
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      if (this.isDemoMode) {
        const result = await demoApiService.register(userData);
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        return { success: true, data: result };
      }

      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        userData
      );

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        const result = await demoApiService.register(userData);
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        return { success: true, data: result };
      } catch (demoError) {
        return {
          success: false,
          error:
            demoError instanceof Error
              ? demoError.message
              : "Ошибка регистрации",
        };
      }
    }
  }

  async verifyToken(): Promise<ApiResponse<User>> {
    const token = localStorage.getItem("token");

    if (!token) {
      return {
        success: false,
        error: "No token found",
      };
    }

    try {
      if (this.isDemoMode) {
        const user = await demoApiService.verifyToken();
        localStorage.setItem("user", JSON.stringify(user));
        return { success: true, data: user };
      }

      const response = await apiService.get<User>(API_ENDPOINTS.VERIFY_TOKEN);

      if (response.success && response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        this.logout();
      }

      return response;
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        const user = await demoApiService.verifyToken();
        localStorage.setItem("user", JSON.stringify(user));
        return { success: true, data: user };
      } catch (demoError) {
        this.logout();
        return {
          success: false,
          error: "Токен недействителен",
        };
      }
    }
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "admin";
  }
}

export const authService = new AuthService();
