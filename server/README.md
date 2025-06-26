# LessElectrical Shop Backend API

Полнофункциональный Node.js бэкенд для интернет-магазина электроники с аутентификацией, управлением пользователями и товарами.

## 🚀 Возможности

- **Аутентификация и авторизация** с JWT токенами
- **Управление пользователями** с ролями (admin/user)
- **CRUD операции для товаров** с фильтрацией и пагинацией
- **Безопасность** с шифрованием паролей и защитой от атак
- **Валидация данных** на всех уровнях
- **База данных MongoDB** с Mongoose ODM
- **Rate limiting** для предотвращения злоупотреблений
- **Готов для деплоя** на Render.com

## 📋 Требования

- Node.js 18+
- MongoDB (локальный или MongoDB Atlas)
- NPM или Yarn

## 🛠 Установка и запуск

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и настройте:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
# Обязательные настройки
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lesselectrical-shop
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5174

# Для продакшина на Render.com
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lesselectrical-shop
# CLIENT_URL=https://your-frontend-domain.com
```

### 3. Инициализация базы данных

```bash
# Создать тестовые данные
npm run init-db
```

### 4. Запуск сервера

```bash
# Разработка (с nodemon)
npm run dev

# Продакшин
npm start
```

## 🗂 Структура проекта

```
server/
├── models/           # Mongoose модели
│   ├── User.js      # Модель пользователя
│   └── Product.js   # Модель товара
├── routes/           # API роуты
│   ├── auth.js      # Аутентификация
│   ├── users.js     # Управление пользователями
│   └── products.js  # Управление товарами
├── middleware/       # Middleware функции
│   ├── auth.js      # JWT аутентификация
│   └── errorHandler.js # Обработка ошибок
├── scripts/          # Утилиты
│   └── initDb.js    # Инициализация БД
├── index.js         # Точка входа
├── package.json     # Зависимости
└── .env.example     # Пример настроек
```

## 🔗 API Endpoints

### Аутентификация (`/api/auth`)

- `POST /register` - Регистрация нового пользователя
- `POST /login` - Вход в систему
- `GET /me` - Получить данные текущего пользователя
- `PUT /me` - Обновить профиль
- `PUT /change-password` - Изменить пароль
- `POST /logout` - Выход из системы

### Пользователи (`/api/users`) 🔒 Требует аутентификации

- `GET /` - Получить всех пользователей (только админ)
- `GET /statistics/overview` - Статистика пользователей (только админ)
- `GET /:id` - Получить пользователя по ID
- `PUT /:id` - Обновить пользователя
- `PUT /:id/role` - Изменить роль пользователя (только админ)
- `PUT /:id/activate` - Активировать/деактивировать (только админ)
- `DELETE /:id` - Удалить пользователя (только админ)

### Товары (`/api/products`)

- `GET /` - Получить товары с фильтрацией и пагинацией
- `GET /categories` - Получить все категории
- `GET /brands` - Получить все бренды
- `GET /statistics/overview` - Статистика товаров 🔒
- `GET /:id` - Получить товар по ID
- `POST /` - Создать товар 🔒 (только админ)
- `PUT /:id` - Обновить товар 🔒 (только админ)
- `PUT /:id/stock` - Обновить остатки 🔒 (только админ)
- `DELETE /:id` - Удалить товар 🔒 (только админ)

## 👥 Тестовые аккаунты

После инициализации БД доступны:

- **Админ**: `admin@shop.com` / `admin123456`
- **Пользователь**: `user@shop.com` / `user123456`
- **Пользователь**: `john.doe@example.com` / `john123456`
- **Пользователь**: `jane.smith@example.com` / `jane123456`

## 🛡 Безопасность

- **Шифрование паролей** с bcrypt (cost 12)
- **JWT токены** для авторизации
- **Rate limiting** - 100 запросов за 15 минут
- **Helmet.js** для HTTP заголовков безопасности
- **CORS** настройка для фронтенда
- **Валидация входных данных** express-validator
- **Soft delete** для товаров
- **Защита от удаления последнего админа**

## 🚀 Деплой на Render.com

### 1. Подготовка

1. Создайте аккаунт на [Render.com](https://render.com)
2. Создайте MongoDB Atlas кластер на [MongoDB Atlas](https://cloud.mongodb.com)

### 2. Настройка базы данных

1. Создайте кластер в MongoDB Atlas
2. Добавьте IP адрес `0.0.0.0/0` в Network Access (для Render)
3. Скопируйте connection string

### 3. Деплой

1. Подключите GitHub репозиторий к Render
2. Выберите папку `server` как Root Directory
3. Настройте переменные окружения:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=super_secure_production_secret
   CLIENT_URL=https://your-frontend-domain.com
   ```
4. Deploy!

### 4. Инициализация продакшин БД

После деплоя выполните в Render Shell:

```bash
npm run init-db
```

## 📝 Пример использования

### Регистрация

```javascript
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "Иван",
    lastName: "Иванов",
    email: "ivan@example.com",
    password: "SecurePass123",
  }),
});
```

### Получение товаров

```javascript
const response = await fetch(
  "/api/products?page=1&limit=12&category=Смартфоны"
);
const data = await response.json();
```

### Авторизованный запрос

```javascript
const response = await fetch("/api/users", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## 🔧 Команды NPM

- `npm start` - Запуск продакшин сервера
- `npm run dev` - Разработка с nodemon
- `npm run init-db` - Инициализация БД с тестовыми данными

## ⚡ Health Check

Проверить состояние API:

```
GET /health
```

Ответ:

```json
{
  "status": "OK",
  "message": "LessElectrical Shop API is running",
  "timestamp": "2025-06-26T..."
}
```

---

**API готов для продакшина и полностью интегрируется с React фронтендом!** 🎉
