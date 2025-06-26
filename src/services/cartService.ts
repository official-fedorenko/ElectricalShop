import { apiService } from "./apiService";
import type { ApiResponse } from "./apiService";
import { API_ENDPOINTS } from "../config/api";
import type { Cart, LocalCartItem, Product } from "../types";

const CART_STORAGE_KEY = "lesselectrical_cart";
const MAX_ITEM_QUANTITY = 5;

class CartService {
  // Методы для работы с localStorage (для неавторизованных пользователей)
  getLocalCart(): LocalCartItem[] {
    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error("Error reading local cart:", error);
      return [];
    }
  }

  saveLocalCart(items: LocalCartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving local cart:", error);
    }
  }

  clearLocalCart(): void {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing local cart:", error);
    }
  }

  // Добавить товар в локальную корзину
  addToLocalCart(product: Product, quantity: number = 1): LocalCartItem[] {
    const localCart = this.getLocalCart();
    const existingItem = localCart.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > MAX_ITEM_QUANTITY) {
        throw new Error(
          `Максимальное количество одного товара - ${MAX_ITEM_QUANTITY} штук`
        );
      }
      existingItem.quantity = newQuantity;
      existingItem.price = product.price; // Обновляем цену
      existingItem.name = product.name; // Обновляем название
      existingItem.image = product.image; // Обновляем изображение
    } else {
      if (quantity > MAX_ITEM_QUANTITY) {
        throw new Error(
          `Максимальное количество одного товара - ${MAX_ITEM_QUANTITY} штук`
        );
      }
      localCart.push({
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image,
      });
    }

    this.saveLocalCart(localCart);
    return localCart;
  }

  // Обновить количество товара в локальной корзине
  updateLocalCartItem(productId: string, quantity: number): LocalCartItem[] {
    if (quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
      throw new Error(`Количество должно быть от 1 до ${MAX_ITEM_QUANTITY}`);
    }

    const localCart = this.getLocalCart();
    const item = localCart.find((item) => item.productId === productId);

    if (!item) {
      throw new Error("Товар не найден в корзине");
    }

    item.quantity = quantity;
    this.saveLocalCart(localCart);
    return localCart;
  }

  // Удалить товар из локальной корзины
  removeFromLocalCart(productId: string): LocalCartItem[] {
    const localCart = this.getLocalCart();
    const filteredCart = localCart.filter(
      (item) => item.productId !== productId
    );
    this.saveLocalCart(filteredCart);
    return filteredCart;
  }

  // API методы для авторизованных пользователей
  async getCart(): Promise<ApiResponse<Cart>> {
    try {
      return await apiService.get<Cart>(API_ENDPOINTS.CART);
    } catch (error) {
      console.error("Error getting cart:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Ошибка получения корзины",
      };
    }
  }

  async addToCart(
    productId: string,
    quantity: number = 1
  ): Promise<ApiResponse<Cart>> {
    try {
      return await apiService.post<Cart>(API_ENDPOINTS.CART_ITEMS, {
        productId,
        quantity,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка добавления в корзину",
      };
    }
  }

  async updateCartItem(
    productId: string,
    quantity: number
  ): Promise<ApiResponse<Cart>> {
    try {
      return await apiService.put<Cart>(
        API_ENDPOINTS.CART_ITEM_BY_ID(productId),
        {
          quantity,
        }
      );
    } catch (error) {
      console.error("Error updating cart item:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Ошибка обновления корзины",
      };
    }
  }

  async removeFromCart(productId: string): Promise<ApiResponse<Cart>> {
    try {
      return await apiService.delete<Cart>(
        API_ENDPOINTS.CART_ITEM_BY_ID(productId)
      );
    } catch (error) {
      console.error("Error removing from cart:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Ошибка удаления из корзины",
      };
    }
  }

  async clearCart(): Promise<ApiResponse<Cart>> {
    try {
      return await apiService.delete<Cart>(API_ENDPOINTS.CART);
    } catch (error) {
      console.error("Error clearing cart:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Ошибка очистки корзины",
      };
    }
  }

  async syncCart(localCartItems: LocalCartItem[]): Promise<ApiResponse<Cart>> {
    try {
      return await apiService.post<Cart>(API_ENDPOINTS.CART_SYNC, {
        localCartItems,
      });
    } catch (error) {
      console.error("Error syncing cart:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка синхронизации корзины",
      };
    }
  }

  // Вспомогательные методы
  calculateLocalCartTotal(localCart: LocalCartItem[]): number {
    return localCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  calculateLocalCartItemsCount(localCart: LocalCartItem[]): number {
    return localCart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartItemQuantity(cart: Cart | LocalCartItem[], productId: string): number {
    if (Array.isArray(cart)) {
      // LocalCartItem[]
      const item = cart.find((item) => item.productId === productId);
      return item ? item.quantity : 0;
    } else {
      // Cart
      const item = cart.items.find((item) => item.productId === productId);
      return item ? item.quantity : 0;
    }
  }

  canAddMoreItems(
    currentQuantity: number,
    additionalQuantity: number = 1
  ): boolean {
    return currentQuantity + additionalQuantity <= MAX_ITEM_QUANTITY;
  }
}

export const cartService = new CartService();
