import type { Product, User } from "../types";
import type { AuthResponse } from "../services/authService";
import type { CreateProductData } from "../services/productService";

// Моковые данные для демонстрации
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    description: "Новейший смартфон Apple с титановым корпусом и камерой Pro",
    price: 1199,
    originalPrice: 1299,
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692895395254",
    category: "smartphones",
    brand: "Apple",
    inStock: true,
    rating: 4.8,
    reviewCount: 156,
    features: ["Titanium корпус", "Камера Pro 48MP", "A17 Pro chip", "USB-C"],
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    description: "Флагманский Android смартфон с S Pen и мощной камерой",
    price: 1099,
    originalPrice: 1199,
    image:
      "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-s928-sm-s928bztqmea-thumb-539573050",
    category: "smartphones",
    brand: "Samsung",
    inStock: true,
    rating: 4.7,
    reviewCount: 203,
    features: ["S Pen", "200MP камера", "AI функции", "5G"],
  },
  {
    id: "3",
    name: 'MacBook Pro 16"',
    description: "Профессиональный ноутбук Apple с чипом M3 Pro",
    price: 2499,
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290",
    category: "laptops",
    brand: "Apple",
    inStock: true,
    rating: 4.9,
    reviewCount: 89,
    features: [
      "M3 Pro chip",
      "Liquid Retina XDR",
      "18 часов работы",
      "Studio звук",
    ],
  },
  {
    id: "4",
    name: "Sony WH-1000XM5",
    description: "Беспроводные наушники с лучшим шумоподавлением",
    price: 399,
    originalPrice: 449,
    image:
      "https://sony.scene7.com/is/image/sonyglobalsolutions/wh-1000xm5_Primary_image?$categorypdpnav$&fmt=png-alpha",
    category: "headphones",
    brand: "Sony",
    inStock: false,
    rating: 4.6,
    reviewCount: 324,
    features: ["30ч работы", "Hi-Res Audio", "Быстрая зарядка", "Multipoint"],
  },
];

export const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@shop.com",
    firstName: "Админ",
    lastName: "Системы",
    role: "admin",
  },
  {
    id: "user-1",
    email: "user@shop.com",
    firstName: "Иван",
    lastName: "Петров",
    role: "user",
  },
  {
    id: "user-2",
    email: "maria@example.com",
    firstName: "Мария",
    lastName: "Сидорова",
    role: "user",
  },
];

export class DemoApiService {
  private delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    await this.delay(800);

    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    // Простая проверка пароля для демо
    if (password.length < 6) {
      throw new Error("Неверный пароль");
    }

    return {
      user,
      token: "demo-jwt-token-" + Date.now(),
    };
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    await this.delay(1000);

    const existingUser = mockUsers.find((u) => u.email === userData.email);
    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const newUser: User = {
      id: "user-" + Date.now(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: "user",
    };

    mockUsers.push(newUser);

    return {
      user: newUser,
      token: "demo-jwt-token-" + Date.now(),
    };
  }

  async verifyToken(): Promise<User> {
    await this.delay(300);

    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      throw new Error("Токен недействителен");
    }

    return JSON.parse(savedUser);
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    await this.delay(500);
    return [...mockProducts];
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    await this.delay(800);

    const newProduct: Product = {
      id: "product-" + Date.now(),
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice,
      image: data.image,
      category: data.category,
      brand: data.brand,
      inStock: data.inStock,
      rating: 0,
      reviewCount: 0,
      features: data.features,
    };

    mockProducts.push(newProduct);
    return newProduct;
  }

  async updateProduct(
    id: string,
    data: Partial<CreateProductData>
  ): Promise<Product> {
    await this.delay(600);

    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Товар не найден");
    }

    const updatedProduct = { ...mockProducts[index], ...data };
    mockProducts[index] = updatedProduct;
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delay(400);

    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("Товар не найден");
    }

    mockProducts.splice(index, 1);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    await this.delay(400);
    return [...mockUsers];
  }

  async updateUserRole(id: string, role: "admin" | "user"): Promise<User> {
    await this.delay(600);

    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    // Проверяем, что не удаляем последнего админа
    if (user.role === "admin" && role === "user") {
      const adminCount = mockUsers.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        throw new Error("Нельзя снять права у последнего администратора");
      }
    }

    user.role = role;
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.delay(500);

    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error("Пользователь не найден");
    }

    const user = mockUsers[userIndex];

    // Проверяем, что не удаляем последнего админа
    if (user.role === "admin") {
      const adminCount = mockUsers.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        throw new Error("Нельзя удалить последнего администратора");
      }
    }

    mockUsers.splice(userIndex, 1);
  }
}

export const demoApiService = new DemoApiService();
