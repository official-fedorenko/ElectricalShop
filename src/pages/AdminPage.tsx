import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Users,
  TrendingUp,
  DollarSign,
  Shield,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { productService } from "../services/productService";
import { userService } from "../services/userService";
import { formatPrice } from "../data/products";
import type { Product, User } from "../types";
import type { CreateProductData, UpdateProductData } from "../services/productService";

const AdminPage: React.FC = () => {
  // Состояние для вкладок
  const [activeTab, setActiveTab] = useState<"products" | "users">("products");
  
  // Общее состояние загрузки
  const [isLoading, setIsLoading] = useState(true);

  // Состояние для товаров
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    brand: "",
    image: "",
    inStock: true,
    features: [] as string[],
  });

  // Состояние для пользователей
  const [users, setUsers] = useState<User[]>([]);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadProducts(), loadUsers()]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        toast.error(response.error || 'Ошибка загрузки товаров');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
      console.error('Error loading products:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        toast.error(response.error || 'Ошибка загрузки пользователей');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
      console.error('Error loading users:', error);
    }
  };

  // Обновляем форму при изменении выбранного продукта
  useEffect(() => {
    if (selectedProduct && modalMode === "edit") {
      setFormData({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price.toString(),
        originalPrice: selectedProduct.originalPrice?.toString() || "",
        category: selectedProduct.category,
        brand: selectedProduct.brand,
        image: selectedProduct.image,
        inStock: selectedProduct.inStock,
        features: selectedProduct.features || [],
      });
    } else {
      resetForm();
    }
  }, [selectedProduct, modalMode]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "",
      brand: "",
      image: "",
      inStock: true,
      features: [],
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddFeature = (feature: string) => {
    if (feature.trim() && !formData.features.includes(feature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature.trim()]
      }));
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        brand: formData.brand,
        image: formData.image,
        inStock: formData.inStock,
        features: formData.features,
      };

      let response;
      if (modalMode === "add") {
        response = await productService.createProduct(productData as CreateProductData);
      } else if (selectedProduct) {
        response = await productService.updateProduct(selectedProduct.id, productData as UpdateProductData);
      }

      if (response?.success) {
        toast.success(
          modalMode === "add" 
            ? "Товар успешно добавлен!" 
            : "Товар успешно обновлен!"
        );
        await loadProducts();
        setIsModalOpen(false);
        setSelectedProduct(null);
        resetForm();
      } else {
        toast.error(response?.error || 'Ошибка при сохранении товара');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

    try {
      const response = await productService.deleteProduct(productId);
      if (response.success) {
        toast.success("Товар успешно удален!");
        await loadProducts();
      } else {
        toast.error(response.error || 'Ошибка при удалении товара');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    setIsUpdatingRole(userId);
    try {
      const response = await userService.updateUserRole(userId, newRole);
      if (response.success) {
        toast.success(`Роль пользователя изменена на ${newRole === 'admin' ? 'администратор' : 'пользователь'}`);
        await loadUsers();
      } else {
        toast.error(response.error || 'Ошибка при изменении роли');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
      console.error('Error updating user role:', error);
    } finally {
      setIsUpdatingRole(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;

    setIsDeletingUser(userId);
    try {
      const response = await userService.deleteUser(userId);
      if (response.success) {
        toast.success("Пользователь успешно удален!");
        await loadUsers();
      } else {
        toast.error(response.error || 'Ошибка при удалении пользователя');
      }
    } catch (error) {
      toast.error('Ошибка соединения с сервером');
      console.error('Error deleting user:', error);
    } finally {
      setIsDeletingUser(null);
    }
  };

  const openModal = (mode: "add" | "edit", product?: Product) => {
    setModalMode(mode);
    setSelectedProduct(product || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const adminUsers = users.filter(u => u.role === 'admin');
  const canDeleteUser = (user: User) => {
    // Нельзя удалять если это последний админ
    return !(user.role === 'admin' && adminUsers.length <= 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>
          <p className="text-gray-600">Управление товарами и пользователями</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Товары</p>
                <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Пользователи</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">В наличии</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.filter(p => p.inStock).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Средняя цена</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {products.length > 0 
                    ? formatPrice(products.reduce((acc, p) => acc + p.price, 0) / products.length)
                    : formatPrice(0)
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "products"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package className="h-5 w-5 inline mr-2" />
                Товары
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="h-5 w-5 inline mr-2" />
                Пользователи
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "products" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Управление товарами</h2>
                  <button
                    onClick={() => openModal("add")}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить товар
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Товар
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Категория
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Цена
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={product.image}
                                alt={product.name}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.brand}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 capitalize">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatPrice(product.price)}
                              {product.originalPrice && (
                                <span className="ml-2 text-xs text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.inStock
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {product.inStock ? "В наличии" : "Нет в наличии"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => openModal("edit", product)}
                              className="text-primary-600 hover:text-primary-900 mr-3"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {products.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Товары не найдены</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Управление пользователями</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Пользователь
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Роль
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 font-medium">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500 dropdown-text">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                              {user.role === "admin" ? "Администратор" : "Пользователь"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {user.role === "user" ? (
                                <button
                                  onClick={() => handleUpdateUserRole(user.id, "admin")}
                                  disabled={isUpdatingRole === user.id}
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50"
                                >
                                  {isUpdatingRole === user.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <UserCheck className="h-3 w-3 mr-1" />
                                  )}
                                  Сделать админом
                                </button>
                              ) : (
                                adminUsers.length > 1 && (
                                  <button
                                    onClick={() => handleUpdateUserRole(user.id, "user")}
                                    disabled={isUpdatingRole === user.id}
                                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-md hover:bg-orange-200 disabled:opacity-50"
                                  >
                                    {isUpdatingRole === user.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                    ) : (
                                      <UserX className="h-3 w-3 mr-1" />
                                    )}
                                    Снять права
                                  </button>
                                )
                              )}
                              
                              {canDeleteUser(user) && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={isDeletingUser === user.id}
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50"
                                >
                                  {isDeletingUser === user.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Trash2 className="h-3 w-3 mr-1" />
                                  )}
                                  Удалить
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Пользователи не найдены</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для добавления/редактирования товара */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {modalMode === "add" ? "Добавить товар" : "Редактировать товар"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название товара
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Бренд
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена (€)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Старая цена (€)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Выберите категорию</option>
                    <option value="smartphones">Смартфоны</option>
                    <option value="laptops">Ноутбуки</option>
                    <option value="tablets">Планшеты</option>
                    <option value="headphones">Наушники</option>
                    <option value="accessories">Аксессуары</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL изображения
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">В наличии</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Особенности (по одной на строку)
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...formData.features];
                          newFeatures[index] = e.target.value;
                          setFormData(prev => ({ ...prev, features: newFeatures }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const feature = prompt('Введите особенность:');
                      if (feature) handleAddFeature(feature);
                    }}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    + Добавить особенность
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {modalMode === "add" ? "Добавить" : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
