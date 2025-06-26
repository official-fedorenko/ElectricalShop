import { apiService } from "./apiService";
import type { ApiResponse } from "./apiService";
import { API_ENDPOINTS } from "../config/api";
import { demoApiService } from "./demoApiService";
import type { Product } from "../types";

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  inStock: boolean;
  features: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductStats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  categoriesCount: number;
}

class ProductService {
  private isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      if (this.isDemoMode) {
        const products = await demoApiService.getProducts();
        return { success: true, data: products };
      }

      return await apiService.get<Product[]>(API_ENDPOINTS.PRODUCTS);
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        const products = await demoApiService.getProducts();
        return { success: true, data: products };
      } catch (demoError) {
        return {
          success: false,
          error: "Ошибка загрузки товаров",
        };
      }
    }
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      if (this.isDemoMode) {
        const products = await demoApiService.getProducts();
        const product = products.find((p) => p.id === id);
        if (!product) {
          return { success: false, error: "Товар не найден" };
        }
        return { success: true, data: product };
      }

      return await apiService.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id));
    } catch (error) {
      return {
        success: false,
        error: "Ошибка загрузки товара",
      };
    }
  }

  async createProduct(
    productData: CreateProductData
  ): Promise<ApiResponse<Product>> {
    try {
      if (this.isDemoMode) {
        const product = await demoApiService.createProduct(productData);
        return { success: true, data: product };
      }

      return await apiService.post<Product>(
        API_ENDPOINTS.PRODUCTS,
        productData
      );
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        const product = await demoApiService.createProduct(productData);
        return { success: true, data: product };
      } catch (demoError) {
        return {
          success: false,
          error:
            demoError instanceof Error
              ? demoError.message
              : "Ошибка создания товара",
        };
      }
    }
  }

  async updateProduct(
    id: string,
    productData: UpdateProductData
  ): Promise<ApiResponse<Product>> {
    try {
      if (this.isDemoMode) {
        const product = await demoApiService.updateProduct(id, productData);
        return { success: true, data: product };
      }

      return await apiService.put<Product>(
        API_ENDPOINTS.PRODUCT_BY_ID(id),
        productData
      );
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        const product = await demoApiService.updateProduct(id, productData);
        return { success: true, data: product };
      } catch (demoError) {
        return {
          success: false,
          error:
            demoError instanceof Error
              ? demoError.message
              : "Ошибка обновления товара",
        };
      }
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      if (this.isDemoMode) {
        await demoApiService.deleteProduct(id);
        return { success: true };
      }

      return await apiService.delete<void>(API_ENDPOINTS.PRODUCT_BY_ID(id));
    } catch (error) {
      // Fallback to demo mode if API is unavailable
      try {
        await demoApiService.deleteProduct(id);
        return { success: true };
      } catch (demoError) {
        return {
          success: false,
          error:
            demoError instanceof Error
              ? demoError.message
              : "Ошибка удаления товара",
        };
      }
    }
  }

  async getProductStats(): Promise<ApiResponse<ProductStats>> {
    try {
      if (this.isDemoMode) {
        const products = await demoApiService.getProducts();
        const stats: ProductStats = {
          totalProducts: products.length,
          inStockProducts: products.filter((p) => p.inStock).length,
          outOfStockProducts: products.filter((p) => !p.inStock).length,
          totalValue: products.reduce((sum, p) => sum + p.price, 0),
          categoriesCount: new Set(products.map((p) => p.category)).size,
        };
        return { success: true, data: stats };
      }

      return await apiService.get<ProductStats>(
        `${API_ENDPOINTS.STATS}/products`
      );
    } catch (error) {
      return {
        success: false,
        error: "Ошибка загрузки статистики",
      };
    }
  }

  // Вспомогательные методы для локальной фильтрации
  filterProducts(
    products: Product[],
    searchTerm: string,
    category: string
  ): Product[] {
    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !category || category === "all" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }

  getUniqueCategories(products: Product[]): string[] {
    const categories = products.map((product) => product.category);
    return [...new Set(categories)].sort();
  }
}

export const productService = new ProductService();
