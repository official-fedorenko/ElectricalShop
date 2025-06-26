import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowLeft, Package, Truck } from "lucide-react";

const OrderSuccessPage: React.FC = () => {
  // В реальном приложении номер заказа будет передаваться через состояние или параметры маршрута
  const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Иконка успеха */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          {/* Заголовок */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Заказ успешно оформлен!
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Спасибо за покупку! Ваш заказ принят в обработку.
          </p>

          {/* Номер заказа */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Номер заказа
            </h2>
            <p className="text-2xl font-mono font-bold text-primary-600">
              #{orderNumber}
            </p>
          </div>

          {/* Что дальше */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Подготовка заказа
              </h3>
              <p className="text-sm text-gray-600">
                Мы начнем собирать ваш заказ в течение нескольких часов
              </p>
            </div>

            <div className="text-center p-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Доставка
              </h3>
              <p className="text-sm text-gray-600">
                Вы получите уведомление о статусе доставки на email
              </p>
            </div>
          </div>

          {/* Информация */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Важная информация:
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Подтверждение заказа отправлено на ваш email
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Ожидаемое время доставки: 3-5 рабочих дней
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                Вы можете отследить статус заказа в личном кабинете
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                При возникновении вопросов обращайтесь в службу поддержки
              </li>
            </ul>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Продолжить покупки
            </Link>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Распечатать заказ
            </button>
          </div>

          {/* Контакты поддержки */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Вопросы по заказу? Свяжитесь с нами:
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                📧 support@lesselectrical.com
              </p>
              <p className="text-sm text-gray-600">📞 +7 (800) 123-45-67</p>
              <p className="text-sm text-gray-600">💬 Онлайн-чат на сайте</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
