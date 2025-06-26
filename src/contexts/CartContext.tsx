import React, { createContext, useContext, useState, useEffect } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import type { Cart, LocalCartItem, Product, CartContextType } from "../types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем корзину при инициализации и изменении пользователя
  useEffect(() => {
    if (!authLoading) {
      loadCart();
    }
  }, [user, authLoading]);

  const loadCart = async () => {
    console.log("🔄 loadCart called, user:", !!user);

    if (user) {
      // Для авторизованных пользователей сначала синхронизируем, затем загружаем серверную корзину
      try {
        setIsLoading(true);

        // Если есть локальная корзина, синхронизируем её с сервером
        const localCartData = cartService.getLocalCart();
        console.log("🗂️ Local cart data:", localCartData);

        if (localCartData.length > 0) {
          console.log("🔄 Syncing local cart with server...", localCartData);
          const syncResponse = await cartService.syncCart(localCartData);
          console.log("🔄 Sync response:", syncResponse);

          if (syncResponse.success && syncResponse.data) {
            console.log("✅ Sync successful, setting cart:", syncResponse.data);
            setCart(syncResponse.data);
            // Очищаем локальную корзину после синхронизации
            cartService.clearLocalCart();
            setLocalCart([]);
            toast.success("Корзина синхронизирована");
          }
        } else {
          // Если локальной корзины нет, просто загружаем серверную
          console.log("📡 Loading server cart...");
          const response = await cartService.getCart();
          console.log("📡 Server cart response:", response);

          if (response.success && response.data) {
            console.log("✅ Server cart loaded:", response.data);
            setCart(response.data);
          }
        }
      } catch (error) {
        console.error("❌ Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Для неавторизованных пользователей используем локальную корзину
      console.log("👤 Loading local cart for guest user");
      const localCartData = cartService.getLocalCart();
      console.log("👤 Local cart data:", localCartData);
      setLocalCart(localCartData);
      setCart(null);
    }
  };

  const syncCart = async () => {
    if (!user || localCart.length === 0) return;

    try {
      setIsLoading(true);
      const response = await cartService.syncCart(localCart);
      if (response.success && response.data) {
        setCart(response.data);
        // Очищаем локальную корзину после синхронизации
        cartService.clearLocalCart();
        setLocalCart([]);
        toast.success("Корзина синхронизирована");
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
      toast.error("Ошибка синхронизации корзины");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!product.inStock) {
      toast.error("Товар нет в наличии");
      return;
    }

    try {
      setIsLoading(true);
      console.log("🛒 Adding to cart:", {
        product: product.name,
        quantity,
        user: !!user,
      });

      if (user) {
        // Для авторизованных пользователей используем API
        console.log("📡 Using API for authorized user");
        const response = await cartService.addToCart(product.id, quantity);
        console.log("📡 API response:", response);

        if (response.success && response.data) {
          console.log("✅ Cart updated via API:", response.data);
          setCart(response.data);
          toast.success(`${product.name} добавлен в корзину`);
        } else {
          console.log("❌ API failed, using fallback to local cart");
          // Fallback на локальную корзину
          const updatedLocalCart = cartService.addToLocalCart(
            product,
            quantity
          );
          setLocalCart(updatedLocalCart);
          toast.success(`${product.name} добавлен в корзину`);
        }
      } else {
        // Для неавторизованных пользователей используем локальную корзину
        console.log("💾 Using local cart for guest user");
        const updatedLocalCart = cartService.addToLocalCart(product, quantity);
        setLocalCart(updatedLocalCart);
        toast.success(`${product.name} добавлен в корзину`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка добавления в корзину";
      console.error("❌ Add to cart error:", error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      setIsLoading(true);

      if (user && cart) {
        // Для авторизованных пользователей используем API
        const response = await cartService.updateCartItem(productId, quantity);
        if (response.success && response.data) {
          setCart(response.data);
          toast.success("Количество обновлено");
        } else {
          // Fallback на локальную корзину
          const updatedLocalCart = cartService.updateLocalCartItem(
            productId,
            quantity
          );
          setLocalCart(updatedLocalCart);
          toast.success("Количество обновлено");
        }
      } else {
        // Для неавторизованных пользователей используем локальную корзину
        const updatedLocalCart = cartService.updateLocalCartItem(
          productId,
          quantity
        );
        setLocalCart(updatedLocalCart);
        toast.success("Количество обновлено");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка обновления корзины";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setIsLoading(true);

      if (user && cart) {
        // Для авторизованных пользователей используем API
        const response = await cartService.removeFromCart(productId);
        if (response.success && response.data) {
          setCart(response.data);
          toast.success("Товар удален из корзины");
        } else {
          // Fallback на локальную корзину
          const updatedLocalCart = cartService.removeFromLocalCart(productId);
          setLocalCart(updatedLocalCart);
          toast.success("Товар удален из корзины");
        }
      } else {
        // Для неавторизованных пользователей используем локальную корзину
        const updatedLocalCart = cartService.removeFromLocalCart(productId);
        setLocalCart(updatedLocalCart);
        toast.success("Товар удален из корзины");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка удаления из корзины";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);

      if (user && cart) {
        // Для авторизованных пользователей используем API
        const response = await cartService.clearCart();
        if (response.success && response.data) {
          setCart(response.data);
          toast.success("Корзина очищена");
        } else {
          // Fallback на локальную корзину
          cartService.clearLocalCart();
          setLocalCart([]);
          toast.success("Корзина очищена");
        }
      } else {
        // Для неавторизованных пользователей очищаем локальную корзину
        cartService.clearLocalCart();
        setLocalCart([]);
        toast.success("Корзина очищена");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка очистки корзины";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getCartItemsCount = (): number => {
    if (user && cart) {
      return cart.totalItems;
    } else {
      return cartService.calculateLocalCartItemsCount(localCart);
    }
  };

  const getCartTotal = (): number => {
    if (user && cart) {
      return cart.totalAmount;
    } else {
      return cartService.calculateLocalCartTotal(localCart);
    }
  };

  const value: CartContextType = {
    cart,
    localCart,
    isLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemsCount,
    getCartTotal,
    syncCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
