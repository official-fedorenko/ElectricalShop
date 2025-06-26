# LessElectrical Shop

Современный интернет-магазин электроники, построенный с использованием React, TypeScript и Tailwind CSS.

![Electronics Shop](https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop)

## 🚀 Особенности

- **Современный UI/UX** - адаптивный дизайн с красивыми анимациями
- **Аутентификация** - система входа/регистрации с ролевым доступом
- **Каталог товаров** - фильтрация, поиск, различные режимы просмотра
- **Админпанель** - управление товарами и заказами
- **TypeScript** - типизированный код для лучшей разработки
- **Tailwind CSS** - утилитарные классы для быстрой стилизации

## 🛠 Технологии

- **Frontend**: React 18, TypeScript, Vite
- **Стилизация**: Tailwind CSS
- **Роутинг**: React Router DOM
- **Иконки**: Lucide React
- **UI**: Headless UI (для доступности)

## 📦 Установка и запуск

1. Клонируйте репозиторий или используйте существующую папку
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Запустите проект в режиме разработки:
   ```bash
   npm run dev
   ```
4. Откройте [http://localhost:5173](http://localhost:5173) в браузере

## 🔐 Тестовые аккаунты

Для тестирования функциональности используйте следующие данные:

- **Администратор**: `admin@shop.com` (любой пароль)
- **Пользователь**: `user@shop.com` (любой пароль)

## 📱 Страницы

- **Главная** (`/`) - каталог товаров с фильтрацией
- **Вход** (`/login`) - форма авторизации
- **Регистрация** (`/register`) - форма регистрации нового пользователя
- **Админпанель** (`/admin`) - управление товарами (только для админов)

## 🏗 Структура проекта

```
src/
├── components/          # React компоненты
│   ├── Header.tsx       # Шапка сайта
│   └── ProductCard.tsx  # Карточка товара
├── contexts/            # React контексты
│   └── AuthContext.tsx  # Контекст аутентификации
├── pages/               # Страницы приложения
│   ├── HomePage.tsx     # Главная страница
│   ├── LoginPage.tsx    # Страница входа
│   ├── RegisterPage.tsx # Страница регистрации
│   └── AdminPage.tsx    # Админпанель
├── types/               # TypeScript типы
│   └── index.ts         # Определения типов
└── App.tsx              # Главный компонент
```

## 🎨 Дизайн-система

Проект использует современную цветовую палитру:

- **Основной цвет**: Blue (primary-500: #3b82f6)
- **Вторичный**: Gray (secondary-500: #64748b)
- **Фон**: Light Gray (#f8fafc)

## 📱 Адаптивность

Интерфейс полностью адаптирован для различных устройств:

- **Desktop** (1024px+) - полная функциональность
- **Tablet** (768px-1023px) - адаптированная сетка
- **Mobile** (до 767px) - мобильное меню и компактный вид

## 🔧 Команды

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build

# Предварительный просмотр сборки
npm run preview

# Проверка кода с ESLint
npm run lint
```

## 🤝 Разработка

Проект настроен для эффективной разработки:

- **Hot Module Replacement** - мгновенные обновления
- **TypeScript** - проверка типов
- **ESLint** - контроль качества кода
- **Tailwind CSS** - быстрая стилизация

## 📄 Лицензия

MIT License - используйте свободно для любых целей.
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
