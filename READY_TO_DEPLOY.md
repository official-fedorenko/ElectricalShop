# 🚀 Пошаговая инструкция деплоя LessElectrical Shop на Render.com

## ✅ Статус подготовки проекта

Ваш проект **ГОТОВ** к деплою! Все файлы настроены правильно.

## 📁 Структура проекта для деплоя

```
ElectricalShop/
├── server/              # Бэкенд (отдельный сервис)
│   ├── package.json     # ✅ Готов
│   ├── index.js         # ✅ Готов
│   ├── routes/          # ✅ Готов
│   ├── middleware/      # ✅ Готов
│   └── data/            # ✅ Готов
├── src/                 # Фронтенд React
├── package.json         # ✅ Готов (фронтенд)
├── vite.config.ts       # ✅ Готов
├── render.yaml          # ✅ Готов (конфигурация Render)
└── public/_redirects    # ✅ Готов (SPA роутинг)
```

## 🔧 Что было настроено

1. **Backend сервер**: Express.js с JSON базой данных
2. **Frontend**: React + TypeScript + Vite
3. **CORS**: Настроен для production
4. **Environment variables**: Готовы для production
5. **Build процесс**: Оптимизирован
6. **SPA роутинг**: Настроен через \_redirects

## 🚀 Деплой на Render.com

### Шаг 1: Подготовка репозитория

1. **Убедитесь, что код в Git:**
   ```bash
   git add .
   git commit -m "Ready for Render deploy"
   git push
   ```

### Шаг 2: Деплой с render.yaml (РЕКОМЕНДУЕМЫЙ)

1. **Зайдите на [render.com](https://render.com)**
2. **Создайте аккаунт/войдите**
3. **Нажмите "New" → "Blueprint"**
4. **Подключите ваш GitHub репозиторий**
5. **Render автоматически найдет ваш render.yaml и создаст оба сервиса**

### Шаг 3: Альтернативный способ (создание сервисов вручную)

#### A. Backend сервис:

1. **"New" → "Web Service"**
2. **Подключите репозиторий**
3. **Настройки:**

   - Name: `lesselectrical-shop-backend`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free` или `Starter`

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=[Generate new]
   JWT_EXPIRE=7d
   CLIENT_URL=https://lesselectrical-shop-frontend.onrender.com
   ```

#### B. Frontend сервис:

1. **"New" → "Static Site"**
2. **Подключите тот же репозиторий**
3. **Настройки:**

   - Name: `lesselectrical-shop-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Environment Variables:**
   ```
   VITE_API_URL=https://lesselectrical-shop-backend.onrender.com/api
   VITE_APP_NAME=LessElectrical Shop
   VITE_APP_VERSION=1.0.0
   ```

## 🔗 После деплоя

1. **Backend будет доступен по:** `https://lesselectrical-shop-backend.onrender.com`
2. **Frontend будет доступен по:** `https://lesselectrical-shop-frontend.onrender.com`
3. **Время деплоя:** 5-10 минут для каждого сервиса

## 🐛 Возможные проблемы и решения

### 1. CORS ошибки

- Убедитесь, что CLIENT_URL в backend правильно указывает на frontend URL

### 2. API не отвечает

- Проверьте логи в Render Dashboard
- Убедитесь, что все environment variables установлены

### 3. Frontend не загружается

- Проверьте VITE_API_URL в настройках frontend
- Убедитесь, что файл \_redirects есть в public/

## 📊 Мониторинг

- **Логи**: Доступны в Render Dashboard
- **Метрики**: Автоматически собираются Render
- **Uptime**: Monitoring включен по умолчанию

## 💡 Советы

1. **Free tier Render** засыпает через 15 минут неактивности
2. **Первый запрос** после сна может быть медленным (cold start)
3. **Upgrade до Starter** ($7/месяц) для постоянной работы
4. **Custom domain** можно добавить в настройках сервиса

## 🎉 Готово!

Ваш проект полностью готов к деплою! Просто следуйте инструкции выше.

---

**Нужна помощь?** Проверьте [документацию Render.com](https://render.com/docs)
