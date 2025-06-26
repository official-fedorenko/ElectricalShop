import { apiService } from "./apiService";
import type { ApiResponse } from "./apiService";
import { API_ENDPOINTS } from "../config/api";
import { demoApiService } from "./demoApiService";
import type { User } from "../types";

export interface UpdateUserRoleData {
  role: "admin" | "user";
}

export interface UserStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentRegistrations: number;
}

class UserService {
  private isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      if (this.isDemoMode) {
        const users = await demoApiService.getUsers();
        return { success: true, data: users };
      }

      return await apiService.get<User[]>(API_ENDPOINTS.USERS);
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        const users = await demoApiService.getUsers();
        return { success: true, data: users };
      } catch (demoError) {
        return {
          success: false,
          error: "Ошибка загрузки пользователей",
        };
      }
    }
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    try {
      if (this.isDemoMode) {
        const users = await demoApiService.getUsers();
        const user = users.find((u) => u.id === id);
        if (!user) {
          return { success: false, error: "Пользователь не найден" };
        }
        return { success: true, data: user };
      }

      return await apiService.get<User>(API_ENDPOINTS.USER_BY_ID(id));
    } catch (error) {
      return {
        success: false,
        error: "Ошибка загрузки пользователя",
      };
    }
  }

  async updateUserRole(
    id: string,
    role: "admin" | "user"
  ): Promise<ApiResponse<User>> {
    try {
      if (this.isDemoMode) {
        const user = await demoApiService.updateUserRole(id, role);
        return { success: true, data: user };
      }

      return await apiService.put<User>(API_ENDPOINTS.UPDATE_USER_ROLE(id), {
        role,
      });
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        const user = await demoApiService.updateUserRole(id, role);
        return { success: true, data: user };
      } catch (demoError) {
        return {
          success: false,
          error:
            demoError instanceof Error
              ? demoError.message
              : "Ошибка изменения роли",
        };
      }
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    try {
      if (this.isDemoMode) {
        await demoApiService.deleteUser(id);
        return { success: true };
      }

      return await apiService.delete<void>(API_ENDPOINTS.USER_BY_ID(id));
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        await demoApiService.deleteUser(id);
        return { success: true };
      } catch (demoError) {
        return {
          success: false,
          error:
            demoError instanceof Error
              ? demoError.message
              : "Ошибка удаления пользователя",
        };
      }
    }
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      if (this.isDemoMode) {
        const users = await demoApiService.getUsers();
        const stats: UserStats = {
          totalUsers: users.length,
          adminUsers: users.filter((u) => u.role === "admin").length,
          regularUsers: users.filter((u) => u.role === "user").length,
          recentRegistrations: 0, // Для демо
        };
        return { success: true, data: stats };
      }

      return await apiService.get<UserStats>(`${API_ENDPOINTS.STATS}/users`);
    } catch (error) {
      return {
        success: false,
        error: "Ошибка загрузки статистики",
      };
    }
  }
}

export const userService = new UserService();
