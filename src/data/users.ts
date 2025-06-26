import type { User } from "../types";

// Центральное хранилище пользователей (mock данные)
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@shop.com",
    firstName: "Админ",
    lastName: "Главный",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  },
  {
    id: "2",
    email: "user@shop.com",
    firstName: "Пользователь",
    lastName: "Обычный",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150",
  },
  {
    id: "3",
    email: "john.doe@example.com",
    firstName: "Джон",
    lastName: "Доу",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: "4",
    email: "jane.smith@example.com",
    firstName: "Джейн",
    lastName: "Смит",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
];

// Сервис для управления пользователями
export class UserService {
  private static users: User[] = [...mockUsers];

  // Получить всех пользователей
  static getAllUsers(): User[] {
    return [...this.users];
  }

  // Получить пользователя по ID
  static getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  // Получить пользователя по email
  static getUserByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  // Добавить нового пользователя
  static addUser(user: Omit<User, "id">): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // Обновить пользователя
  static updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    this.users[index] = { ...this.users[index], ...updates };
    return this.users[index];
  }

  // Изменить роль пользователя
  static changeUserRole(id: string, role: "admin" | "user"): User | null {
    return this.updateUser(id, { role });
  }

  // Удалить пользователя
  static deleteUser(id: string): boolean {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  // Сбросить пользователей к начальному состоянию
  static resetUsers(): void {
    this.users = [...mockUsers];
  }

  // Получить статистику пользователей
  static getUserStats() {
    const totalUsers = this.users.length;
    const adminUsers = this.users.filter(
      (user) => user.role === "admin"
    ).length;
    const regularUsers = this.users.filter(
      (user) => user.role === "user"
    ).length;

    return {
      total: totalUsers,
      admins: adminUsers,
      users: regularUsers,
    };
  }
}
