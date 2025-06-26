import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, MapPin, User } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface OrderForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: "card" | "paypal" | "bank";
  deliveryMethod: "standard" | "express" | "pickup";
}

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cart, localCart, getCartItemsCount, getCartTotal, clearCart } =
    useCart();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OrderForm>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "card",
    deliveryMethod: "standard",
  });

  const cartItems = user ? cart?.items || [] : localCart;
  const totalItems = getCartItemsCount();
  const totalPrice = getCartTotal();

  console.log("CheckoutPage - user:", user);
  console.log("CheckoutPage - cart:", cart);
  console.log("CheckoutPage - localCart:", localCart);
  console.log("CheckoutPage - cartItems:", cartItems);

  // Если корзина пуста, перенаправляем
  if (totalItems === 0) {
    navigate("/cart");
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Здесь будет API вызов для создания заказа
      // Пока что симулируем успешное оформление
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Очищаем корзину
      await clearCart();

      toast.success("Заказ успешно оформлен!");
      navigate("/order-success");
    } catch (error) {
      toast.error("Ошибка при оформлении заказа");
    } finally {
      setIsLoading(false);
    }
  };

  const deliveryOptions = [
    {
      id: "standard",
      name: "Стандартная доставка",
      price: 0,
      time: "3-5 рабочих дней",
      description: "Бесплатная доставка",
    },
    {
      id: "express",
      name: "Экспресс доставка",
      price: 15,
      time: "1-2 рабочих дня",
      description: "Быстрая доставка",
    },
    {
      id: "pickup",
      name: "Самовывоз",
      price: 0,
      time: "В любое время",
      description: "Забрать в магазине",
    },
  ];

  const paymentOptions = [
    {
      id: "card",
      name: "Банковская карта",
      icon: CreditCard,
      description: "Visa, MasterCard, МИР",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: CreditCard,
      description: "Оплата через PayPal",
    },
    {
      id: "bank",
      name: "Банковский перевод",
      icon: CreditCard,
      description: "Перевод на расчетный счет",
    },
  ];

  const selectedDelivery = deliveryOptions.find(
    (option) => option.id === formData.deliveryMethod
  );
  const finalTotal = totalPrice + (selectedDelivery?.price || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Вернуться в корзину
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Оформление заказа
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:grid lg:grid-cols-3 lg:gap-8"
        >
          {/* Форма заказа */}
          <div className="lg:col-span-2 space-y-8">
            {/* Контактная информация */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Контактная информация
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Адрес доставки */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Адрес доставки
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required={formData.deliveryMethod !== "pickup"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Город *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required={formData.deliveryMethod !== "pickup"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Почтовый индекс *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required={formData.deliveryMethod !== "pickup"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Способ доставки */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Truck className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Способ доставки
                </h2>
              </div>

              <div className="space-y-4">
                {deliveryOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={option.id}
                      checked={formData.deliveryMethod === option.id}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">
                            {option.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {option.description}
                          </p>
                          <p className="text-sm text-gray-500">{option.time}</p>
                        </div>
                        <span className="font-medium text-gray-900">
                          {option.price === 0
                            ? "Бесплатно"
                            : `€${option.price}`}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Способ оплаты */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Способ оплаты
                </h2>
              </div>

              <div className="space-y-4">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.id}
                      className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={formData.paymentMethod === option.id}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <Icon className="h-6 w-6 text-gray-400 ml-4 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {option.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Итоги заказа */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Ваш заказ
              </h2>

              {/* Товары */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={item.image || "/placeholder-product.jpg"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × €{item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200 mb-6" />

              {/* Расчеты */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Товары:</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Доставка:</span>
                  <span>
                    {selectedDelivery?.price === 0
                      ? "Бесплатно"
                      : `€${selectedDelivery?.price}`}
                  </span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого:</span>
                  <span>€{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Кнопка оформления */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Оформление..."
                  : `Оформить заказ на €${finalTotal.toFixed(2)}`}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Нажимая кнопку "Оформить заказ", вы соглашаетесь с условиями
                использования и политикой конфиденциальности
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
