# Инструкции по деплою LessElectrical Shop

## Требования на сервере

- Node.js 18+
- npm или yarn
- PM2 (для продакшена)

## Структура проекта

```
lessElectricalShop/
├── server/          # Backend (Express + JSON database)
├── src/             # Frontend (React + TypeScript + Vite)
└── dist/            # Build frontend (после сборки)
```

## Пошаговый деплой

### 1. Подготовка файлов

Скопировать на сервер весь проект, включая:

- `/server` - backend код
- `/src` - frontend код
- `/package.json` - зависимости frontend
- `/server/package.json` - зависимости backend

### 2. Настройка переменных окружения

#### Backend (.env в папке server/)

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_123456789
JWT_EXPIRE=7d
CLIENT_URL=https://your-domain.com
```

#### Frontend (.env.production в корне проекта)

```
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=LessElectrical Shop
VITE_APP_VERSION=1.0.0
```

### 3. Установка зависимостей

```bash
# Backend
cd server
npm install

# Frontend
cd ..
npm install
```

### 4. Сборка frontend

```bash
npm run build:prod
```

### 5. Запуск в продакшене

```bash
# Установка PM2 (если не установлен)
npm install -g pm2

# Запуск backend через PM2
cd server
pm2 start index.js --name "lesselectrical-backend"

# Проверка статуса
pm2 status
pm2 logs lesselectrical-backend
```

### 6. Настройка веб-сервера (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (статические файлы)
    location / {
        root /path/to/project/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Данные пользователей для тестирования

### Администратор

- Email: admin@shop.com
- Пароль: admin

### Обычный пользователь

- Email: user@shop.com
- Пароль: user

## Особенности работы корзины

1. **Для гостей**: корзина сохраняется в localStorage браузера
2. **Для авторизованных**: корзина сохраняется на сервере в JSON файлах
3. **При входе**: автоматическая синхронизация localStorage → сервер
4. **При выходе**: корзина остается на сервере, локальная корзина очищается

## Возможные проблемы

### CORS ошибки

Убедитесь, что CLIENT_URL в backend .env соответствует домену frontend

### Порты

- Backend: 5000 (настраивается в .env)
- Frontend в dev режиме: 5173
- Frontend в продакшене: статические файлы через Nginx

### Права доступа

Убедитесь, что у Node.js есть права на чтение/запись файлов в папке server/data/

## Команды для мониторинга

```bash
# Статус процессов
pm2 status

# Логи
pm2 logs lesselectrical-backend

# Перезапуск
pm2 restart lesselectrical-backend

# Остановка
pm2 stop lesselectrical-backend
```
