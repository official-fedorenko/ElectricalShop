export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  VERIFY_TOKEN: "/auth/verify",

  // User endpoints
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,
  UPDATE_USER_ROLE: (id: string) => `/users/${id}/role`,

  // Product endpoints
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,

  // Cart endpoints
  CART: "/cart",
  CART_ITEMS: "/cart/items",
  CART_ITEM_BY_ID: (productId: string) => `/cart/items/${productId}`,
  CART_SYNC: "/cart/sync",

  // Stats endpoints
  STATS: "/stats",
} as const;
