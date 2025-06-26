import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const CartPage: React.FC = () => {
  const { user } = useAuth();
  const {
    cart,
    localCart,
    getCartItemsCount,
    getCartTotal,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();

  const cartItems = user ? cart?.items || [] : localCart;
  const totalItems = getCartItemsCount();
  const totalPrice = getCartTotal();

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Корзина пуста
            </h1>
            <p className="text-gray-600 mb-8">
              Добавьте товары в корзину, чтобы продолжить покупки
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Вернуться к покупкам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Продолжить покупки
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Корзина ({totalItems}{" "}
            {totalItems === 1 ? "товар" : totalItems < 5 ? "товара" : "товаров"}
            )
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Список товаров */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Товары в корзине
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Очистить корзину
                  </button>
                </div>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {/* Изображение товара */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Информация о товаре */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Цена за единицу: €{item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Управление количеством */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateCartItem(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartItem(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= 5}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Общая стоимость и удаление */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Итоги заказа */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Итоги заказа
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Товары ({totalItems}):</span>
                  <span className="font-medium">€{totalPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Доставка:</span>
                  <span className="font-medium text-green-600">Бесплатно</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого:</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center block"
                >
                  Оформить заказ
                </Link>

                <Link
                  to="/"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center block"
                >
                  Продолжить покупки
                </Link>
              </div>

              {/* Дополнительная информация */}
              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2">✓ Бесплатная доставка при заказе от €50</p>
                <p className="mb-2">✓ Гарантия на все товары</p>
                <p>✓ Возврат в течение 14 дней</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
