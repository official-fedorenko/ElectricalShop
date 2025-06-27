# 🚀 Деплой LessElectrical Shop на Render.com

Пошаговое руководство по развертыванию React + Node.js приложения на Render.com

## 📋 Предварительные требования

- [x] Аккаунт на [Render.com](https://render.com)
- [x] Код загружен в Git репозиторий (GitHub/GitLab/Bitbucket)
- [x] Файл `render.yaml` в корне проекта
- [x] Правильная структура проекта

## 🏗️ Структура проекта

```
ElectricalShop/
├── server/                 # Backend (Node.js + Express)
│   ├── package.json
│   ├── index.js
│   ├── routes/
│   ├── middleware/
│   └── data/
├── src/                    # Frontend (React + TypeScript)
├── public/
│   └── _redirects         # SPA routing для Render
├── package.json           # Frontend dependencies
├── vite.config.ts
└── render.yaml           # Конфигурация для Render
```

## 🎯 Способ 1: Blueprint (Автоматический деплой)

### Шаг 1: Подготовка файла render.yaml

Убедитесь, что ваш `render.yaml` содержит правильную конфигурацию:

```yaml
services:
  - type: web
    name: lesselectrical-shop-backend
    env: node
    rootDir: ./server
    buildCommand: npm install
    startCommand: npm start
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 7d
      - key: CLIENT_URL
        value: https://lesselectrical-shop-frontend.onrender.com

  - type: web
    name: lesselectrical-shop-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    plan: free
    envVars:
      - key: VITE_API_URL
        value: https://lesselectrical-shop-backend.onrender.com/api
      - key: VITE_APP_NAME
        value: LessElectrical Shop
      - key: VITE_APP_VERSION
        value: 1.0.0
```

### Шаг 2: Создание Blueprint

1. **Войдите на [render.com](https://render.com)**
2. **Нажмите "New +" → "Blueprint"**
3. **Заполните поля:**

   - **Repository**: Выберите ваш репозиторий
   - **Blueprint Name**: `LessElectrical Shop Full Stack`
   - **Branch**: `main`
   - **Blueprint YAML File Path**: `render.yaml`

4. **Нажмите "Create Blueprint"**

### Шаг 3: Добавление платежной информации

⚠️ **Важно**: Render требует карту для Blueprint, но **не списывает деньги** за free-план сервисы.

- Добавьте карту в разделе Billing
- Создание сервисов займет ~10-15 минут

## 🔧 Способ 2: Создание сервисов вручную (без карты)

### Backend (Web Service)

1. **New → Web Service**
2. **Connect Repository** → выберите репозиторий
3. **Настройки:**

   ```
   Name: lesselectrical-shop-backend
   Root Directory: server
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Environment Variables:**

   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your_super_secret_key_123456789
   JWT_EXPIRE=7d
   CLIENT_URL=https://lesselectrical-shop-frontend.onrender.com
   ```

5. **Create Web Service**

### Frontend (Static Site)

1. **New → Static Site**
2. **Connect Repository** → тот же репозиторий
3. **Настройки:**

   ```
   Name: lesselectrical-shop-frontend
   Branch: main
   Root Directory: (пустое)
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Environment Variables:**

   ```
   VITE_API_URL=https://lesselectrical-shop-backend.onrender.com/api
   VITE_APP_NAME=LessElectrical Shop
   VITE_APP_VERSION=1.0.0
   ```

5. **Create Static Site**

## 🔄 Обновление CLIENT_URL

После создания frontend сервиса:

1. Скопируйте URL frontend сервиса
2. Зайдите в настройки backend сервиса
3. Обновите переменную `CLIENT_URL` с новым URL

## 📝 Важные файлы для правильной работы

### 1. public/\_redirects (для SPA роутинга)

```
/*    /index.html   200
```

### 2. server/package.json

```json
{
  "name": "lesselectrical-shop-backend",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.0"
  }
}
```

### 3. package.json (корень проекта)

```json
{
  "name": "lesselectrical-shop",
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

## 🌐 Проверка деплоя

После завершения деплоя проверьте:

### Backend проверка

- Откройте `https://your-backend-url.onrender.com/api/health`
- Должен вернуть JSON ответ

### Frontend проверка

- Откройте `https://your-frontend-url.onrender.com`
- Убедитесь, что страница загружается
- Проверьте работу API запросов

## ⚡ Особенности Render.com

### Free Plan ограничения:

- **Web Services**: засыпают через 15 минут неактивности
- **Static Sites**: не засыпают, всегда доступны
- **Cold Start**: первый запрос после сна ~30 секунд
- **750 часов/месяц** для web services

### Рекомендации:

- Используйте внешний cron для keep-alive backend
- Оптимизируйте время загрузки приложения
- Настройте мониторинг uptime

## 🔧 Устранение проблем

### Backend не запускается

```bash
# Проверьте логи в Render Dashboard
# Убедитесь, что server/package.json содержит "start" скрипт
# Проверьте PORT переменную (должна быть 10000)
```

### Frontend сборка падает

```bash
# Проверьте, что package.json в корне
# Убедитесь в наличии "build" скрипта
# Проверьте TypeScript ошибки
```

### CORS ошибки

```javascript
// В server/index.js добавьте правильный CLIENT_URL
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
```

## 🎉 Готово!

После успешного деплоя ваше приложение будет доступно по URL:

- **Frontend**: `https://lesselectrical-shop-frontend.onrender.com`
- **Backend API**: `https://lesselectrical-shop-backend.onrender.com/api`

### Тестовые пользователи:

- **Admin**: `admin@shop.com` / `admin123`
- **User**: `user@shop.com` / `user123`

---

**💡 Совет**: Сохраните URLs сервисов для дальнейшей настройки и мониторинга!
