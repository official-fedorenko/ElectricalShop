import React, { useState, useEffect } from "react";
import { Filter, Grid, List, Loader2, Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { productService } from "../services/productService";
import { formatPrice } from "../data/products"; // Сохраняем функцию форматирования
import toast from "react-hot-toast";
import type { Product } from "../types";

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем продукты при монтировании компонента
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProducts();
        if (response.success && response.data) {
          setProducts(response.data);
          setFilteredProducts(response.data);

          // Получаем уникальные категории
          const uniqueCategories = productService.getUniqueCategories(
            response.data
          );
          setCategories(["all", ...uniqueCategories]);

          // Устанавливаем диапазон цен на основе загруженных товаров
          if (response.data.length > 0) {
            const prices = response.data.map((p) => p.price);
            const maxPrice = Math.max(...prices);
            setPriceRange([0, maxPrice]);
          }
        } else {
          toast.error(response.error || "Ошибка загрузки товаров");
        }
      } catch (error) {
        toast.error("Ошибка соединения с сервером");
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Фильтрация товаров
  useEffect(() => {
    let filtered = productService.filterProducts(
      products,
      searchTerm,
      selectedCategory
    );

    // Фильтрация по цене
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, priceRange]);

  const handleAddToCart = (product: Product) => {
    console.log("Добавлен в корзину:", product.name);
    toast.success(`${product.name} добавлен в корзину`);
    // Здесь будет логика добавления в корзину
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  const maxPrice =
    products.length > 0 ? Math.max(...products.map((p) => p.price)) : 2000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
              Магазин электроники
            </h1>
            <p className="mt-4 text-xl text-primary-100 max-w-3xl mx-auto">
              Найдите лучшие гаджеты по выгодным ценам. Гарантия качества и
              быстрая доставка.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="#catalog"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  Перейти к каталогу
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Controls */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Найдено: {filteredProducts.length} товаров
                </span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-primary-600"
                        : "text-gray-600"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-primary-600"
                        : "text-gray-600"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Фильтры
                  </h2>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Filter className="h-5 w-5" />
                  </button>
                </div>

                <div
                  className={`space-y-6 ${
                    showFilters ? "block" : "hidden lg:block"
                  }`}
                >
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Категория
                    </h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={selectedCategory === category}
                            onChange={(e) =>
                              setSelectedCategory(e.target.value)
                            }
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">
                            {category === "all" ? "Все категории" : category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Цена
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([
                            priceRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>0€</span>
                        <span>{formatPrice(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {products.length === 0
                      ? "Товары загружаются..."
                      : "Товары не найдены"}
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
