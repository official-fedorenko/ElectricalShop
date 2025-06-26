# Деплой LessElectrical Shop на Render.com

## Подготовка проекта

Ваш проект готов к деплою на Render.com! Вот пошаговая инструкция:

## Структура проекта для деплоя

```
ElectricalShop/
├── server/              # Бэкенд (будет отдельный сервис)
├── src/                 # Фронтенд React app
├── package.json         # Фронтенд зависимости
├── vite.config.ts       # Конфигурация Vite
├── .env.production      # Переменные для фронтенда
└── server/.env.production # Переменные для бэкенда
```

## Пошаговый деплой

### Шаг 1: Подготовка репозитория

1. **Создайте Git репозиторий** (если еще не создан):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Загрузите код на GitHub/GitLab**:
   ```bash
   git remote add origin https://github.com/yourusername/lesselectrical-shop.git
   git push -u origin main
   ```

### Шаг 2: Создание бэкенд сервиса на Render

1. **Зайдите на [render.com](https://render.com)** и создайте аккаунт
2. **Нажмите "New +" → "Web Service"**
3. **Подключите ваш GitHub репозиторий**
4. **Настройте сервис:**

   **Basic Settings:**

   - **Name**: `lesselectrical-shop-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: `Frankfurt (EU Central)` (или ближайший к вам)
   - **Branch**: `main`

   **Build & Deploy:**

   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Environment Variables:**

   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_secure_123456789
   JWT_EXPIRE=7d
   CLIENT_URL=https://lesselectrical-shop-frontend.onrender.com
   ```

5. **Нажмите "Create Web Service"**
6. **Скопируйте URL вашего бэкенда** (например: `https://lesselectrical-shop-backend.onrender.com`)

### Шаг 3: Создание фронтенд сервиса на Render

1. **Нажмите "New +" → "Static Site"**
2. **Подключите тот же GitHub репозиторий**
3. **Настройте сайт:**

   **Basic Settings:**

   - **Name**: `lesselectrical-shop-frontend`
   - **Root Directory**: `. ` (корень проекта)
   - **Branch**: `main`

   **Build & Deploy:**

   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

   **Environment Variables:**

   ```
   VITE_API_URL=https://lesselectrical-shop-backend.onrender.com/api
   VITE_APP_NAME=LessElectrical Shop
   VITE_APP_VERSION=1.0.0
   ```

4. **Нажмите "Create Static Site"**

### Шаг 4: Обновление конфигурации

После создания сервисов, если URL отличаются от предполагаемых:

1. **Обновите переменную CLIENT_URL в бэкенде**
2. **Обновите переменную VITE_API_URL во фронтенде**
3. **Разверните заново** (Render автоматически переразвернет при изменении переменных)

## Альтернативный способ: Единый репозиторий с Docker

Если хотите использовать Docker и единый сервис:

1. **Создайте Web Service**
2. **Root Directory**: `.`
3. **Build Command**: `npm install && npm run build && cd server && npm install`
4. **Start Command**: `cd server && npm start`

## Проверка деплоя

1. **Бэкенд**: Откройте `https://your-backend-url.onrender.com/health`
2. **Фронтенд**: Откройте `https://your-frontend-url.onrender.com`

## Важные заметки

### Безопасность

- Обязательно измените `JWT_SECRET` на случайную строку
- Не добавляйте `.env` файлы в Git

### Performance

- Render бесплатные сервисы засыпают после 15 минут неактивности
- Первый запрос после сна может занять до 30 секунд

### Обновления

- При пуше в основную ветку Render автоматически переразвернет приложение
- Логи доступны в дашборде Render

## Troubleshooting

### Проблема: CORS ошибки

- Проверьте правильность переменной `CLIENT_URL` в бэкенде
- Убедитесь, что фронтенд использует правильный `VITE_API_URL`

### Проблема: 404 ошибки на фронтенде

- Добавьте файл `_redirects` в папку `public/`:
  ```
  /*    /index.html   200
  ```

### Проблема: Медленный запуск

- Рассмотрите использование платного плана для production
- Используйте keep-alive сервисы для предотвращения засыпания

## Мониторинг

Render предоставляет:

- Логи в реальном времени
- Метрики использования
- Статус здоровья сервиса
- Автоматические перезапуски при сбоях

Ваше приложение готово к production использованию! 🚀
