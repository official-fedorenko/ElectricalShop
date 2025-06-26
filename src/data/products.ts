import type { Product } from "../types";

// Центральное хранилище товаров
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    description: "Новейший iPhone с титановым корпусом и передовой камерой",
    price: 1349,
    originalPrice: 1499,
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop",
    category: "Смартфоны",
    brand: "Apple",
    inStock: true,
    rating: 4.8,
    reviewCount: 245,
    features: ["A17 Pro чип", "48MP камера", "Titanium корпус"],
  },
  {
    id: "2",
    name: 'MacBook Air M3 13"',
    description: "Ультратонкий ноутбук с чипом M3 для повседневных задач",
    price: 1199,
    originalPrice: 1299,
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
    category: "Ноутбуки",
    brand: "Apple",
    inStock: true,
    rating: 4.9,
    reviewCount: 189,
    features: ["M3 чип", "18 часов работы", "Liquid Retina дисплей"],
  },
  {
    id: "3",
    name: "Samsung Galaxy S24 Ultra",
    description: "Флагманский смартфон с S Pen и мощной камерой",
    price: 1249,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop",
    category: "Смартфоны",
    brand: "Samsung",
    inStock: true,
    rating: 4.7,
    reviewCount: 312,
    features: ["200MP камера", "S Pen", "Snapdragon 8 Gen 3"],
  },
  {
    id: "4",
    name: "Sony WH-1000XM5",
    description: "Беспроводные наушники с активным шумоподавлением",
    price: 349,
    originalPrice: 399,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
    category: "Наушники",
    brand: "Sony",
    inStock: true,
    rating: 4.6,
    reviewCount: 567,
    features: ["30 часов работы", "Быстрая зарядка", "Hi-Res Audio"],
  },
  {
    id: "5",
    name: 'iPad Pro 12.9" M2',
    description: "Профессиональный планшет для творчества и работы",
    price: 1099,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    category: "Планшеты",
    brand: "Apple",
    inStock: false,
    rating: 4.8,
    reviewCount: 143,
    features: ["M2 чип", "Liquid Retina XDR", "Apple Pencil 2"],
  },
  {
    id: "6",
    name: "Dell XPS 13 Plus",
    description: "Премиальный ультрабук с InfinityEdge дисплеем",
    price: 899,
    originalPrice: 999,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    category: "Ноутбуки",
    brand: "Dell",
    inStock: true,
    rating: 4.5,
    reviewCount: 89,
    features: ["Intel Core i7", "16GB RAM", "4K дисплей"],
  },
  {
    id: "7",
    name: "AirPods Pro 2",
    description: "Беспроводные наушники с адаптивным шумоподавлением",
    price: 249,
    originalPrice: 279,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop",
    category: "Наушники",
    brand: "Apple",
    inStock: true,
    rating: 4.7,
    reviewCount: 892,
    features: ["H2 чип", "Адаптивное шумоподавление", "MagSafe зарядка"],
  },
  {
    id: "8",
    name: 'Samsung 55" Neo QLED 4K',
    description: "Премиальный телевизор с Quantum Matrix Technology",
    price: 1599,
    originalPrice: 1799,
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
    category: "Телевизоры",
    brand: "Samsung",
    inStock: true,
    rating: 4.6,
    reviewCount: 234,
    features: ["Neo QLED", "4K 120Hz", "Smart TV"],
  },
];

// Функции для работы с товарами
export class ProductService {
  private static products: Product[] = [...mockProducts];

  static getAllProducts(): Product[] {
    return [...this.products];
  }

  static getProductById(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  static addProduct(product: Omit<Product, "id">): Product {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return null;

    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  static deleteProduct(id: string): boolean {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    return true;
  }

  static resetProducts(): void {
    this.products = [...mockProducts];
  }
}

// Утилита для форматирования цены в евро
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};
