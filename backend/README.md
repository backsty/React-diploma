# React Diploma Backend

API сервер для дипломного проекта React - интернет-магазин обуви.

## 🚀 Быстрый старт

```bash
# Установить зависимости
bun install

# Запуск в режиме разработки
bun run dev

# Продакшен запуск
bun run start

# Версия с ошибками и задержками (для тестирования)
bun run flaky
```

## 📡 API Endpoints

- `GET /api/top-sales` - Хиты продаж
- `GET /api/categories` - Категории товаров  
- `GET /api/items` - Каталог товаров (с пагинацией и поиском)
- `GET /api/items/:id` - Детальная информация о товаре
- `POST /api/order` - Оформление заказа

## 🛠️ Разработка

```bash
# Линтинг кода
bun run lint

# Проверка форматирования
bun run lint:check

# Тестирование
bun run test

# Сборка
bun run build
```

## 🌐 Деплой

- **Разработка**: http://localhost:7070
- **Продакшен**: https://react-diploma-backend-x0qm.onrender.com/

## 📝 Тестирование API

Используйте файл `api.rest` в VS Code с расширением REST Client.
