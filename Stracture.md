# Структура фронтенда по FSD

src/
├── app/ # Слой приложения
│ ├── index.tsx # Корневой компонент приложения
│ ├── providers/ # Провайдеры приложения
│ │ ├── index.ts
│ │ ├── router.tsx # React Router провайдер
│ │ ├── reatom.tsx # Reatom контекст провайдер
│ │ └── error-boundary.tsx # Error Boundary компонент
│ ├── router/ # Роутинг конфигурация
│ │ ├── index.ts
│ │ └── routes.tsx
│ └── styles/ # Глобальные стили
│ ├── index.css
│ └── globals.css
│
├── pages/ # Слой страниц
│ ├── index.ts # Экспорт всех страниц
│ ├── home/ # Главная страница
│ │ ├── index.ts
│ │ └── ui/
│ │ └── home-page.tsx
│ ├── catalog/ # Страница каталога
│ │ ├── index.ts
│ │ └── ui/
│ │ └── catalog-page.tsx
│ ├── product/ # Страница товара
│ │ ├── index.ts
│ │ └── ui/
│ │ └── product-page.tsx
│ ├── cart/ # Страница корзины
│ │ ├── index.ts
│ │ └── ui/
│ │ └── cart-page.tsx
│ ├── about/ # Страница о магазине
│ │ ├── index.ts
│ │ └── ui/
│ │ └── about-page.tsx
│ ├── contacts/ # Страница контактов
│ │ ├── index.ts
│ │ └── ui/
│ │ └── contacts-page.tsx
│ └── not-found/ # Страница 404
│ ├── index.ts
│ └── ui/
│ └── not-found-page.tsx
│
├── widgets/ # Слой виджетов
│ ├── index.ts
│ ├── header/ # Шапка сайта
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ ├── header.tsx
│ │ │ └── search-widget.tsx
│ │ └── model/
│ │ └── search.ts # Reatom атомы для поиска
│ ├── footer/ # Футер сайта
│ │ ├── index.ts
│ │ └── ui/
│ │ └── footer.tsx
│ ├── top-sales/ # Виджет хитов продаж
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ └── top-sales.tsx
│ │ ├── model/
│ │ │ └── top-sales.ts # Reatom атомы
│ │ └── api/
│ │ └── get-top-sales.ts
│ ├── product-catalog/ # Виджет каталога товаров
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ ├── product-catalog.tsx
│ │ │ ├── category-filter.tsx
│ │ │ └── load-more-button.tsx
│ │ ├── model/
│ │ │ ├── catalog.ts # Reatom атомы
│ │ │ └── categories.ts
│ │ └── api/
│ │ ├── get-items.ts
│ │ └── get-categories.ts
│ ├── cart-widget/ # Виджет корзины в шапке
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ └── cart-widget.tsx
│ │ └── model/
│ │ └── cart-count.ts
│ └── banner/ # Рекламный баннер
│ ├── index.ts
│ └── ui/
│ └── banner.tsx
│
├── features/ # Слой фич
│ ├── index.ts
│ ├── add-to-cart/ # Добавление в корзину
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ ├── add-to-cart-form.tsx
│ │ │ ├── size-selector.tsx
│ │ │ └── quantity-selector.tsx
│ │ └── model/
│ │ └── add-to-cart.ts # Reatom атомы
│ ├── remove-from-cart/ # Удаление из корзины
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ └── remove-button.tsx
│ │ └── model/
│ │ └── remove-from-cart.ts
│ ├── place-order/ # Оформление заказа
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ └── order-form.tsx
│ │ ├── model/
│ │ │ └── order.ts
│ │ └── api/
│ │ └── place-order.ts
│ ├── search-products/ # Поиск товаров
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ └── search-form.tsx
│ │ └── model/
│ │ └── search.ts
│ └── filter-by-category/ # Фильтрация по категориям
│ ├── index.ts
│ ├── ui/
│ │ └── category-tabs.tsx
│ └── model/
│ └── category-filter.ts
│
├── entities/ # Слой сущностей
│ ├── index.ts
│ ├── product/ # Сущность товара
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ ├── product-card.tsx
│ │ │ └── product-details.tsx
│ │ ├── model/
│ │ │ ├── product.ts # Reatom атомы
│ │ │ └── types.ts # TypeScript типы
│ │ └── api/
│ │ └── get-product.ts
│ ├── cart/ # Сущность корзины
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ ├── cart-item.tsx
│ │ │ └── cart-summary.tsx
│ │ ├── model/
│ │ │ ├── cart.ts # Reatom атомы
│ │ │ └── types.ts
│ │ └── lib/
│ │ └── cart-storage.ts # localStorage утилиты
│ ├── category/ # Сущность категории
│ │ ├── index.ts
│ │ ├── ui/
│ │ │ └── category-item.tsx
│ │ ├── model/
│ │ │ ├── category.ts
│ │ │ └── types.ts
│ │ └── api/
│ │ └── get-categories.ts
│ └── order/ # Сущность заказа
│ ├── index.ts
│ ├── model/
│ │ ├── order.ts
│ │ └── types.ts
│ └── api/
│ └── create-order.ts
│
├── shared/ # Общий слой
│ ├── index.ts
│ ├── ui/ # Переиспользуемые UI компоненты
│ │ ├── index.ts
│ │ ├── button/
│ │ │ ├── index.ts
│ │ │ └── button.tsx
│ │ ├── input/
│ │ │ ├── index.ts
│ │ │ └── input.tsx
│ │ ├── loader/
│ │ │ ├── index.ts
│ │ │ └── loader.tsx
│ │ ├── error-message/
│ │ │ ├── index.ts
│ │ │ └── error-message.tsx
│ │ ├── modal/
│ │ │ ├── index.ts
│ │ │ └── modal.tsx
│ │ └── layout/
│ │ ├── index.ts
│ │ └── layout.tsx
│ ├── lib/ # Утилиты и хелперы
│ │ ├── index.ts
│ │ ├── api/
│ │ │ ├── index.ts
│ │ │ ├── base.ts # Базовый API клиент
│ │ │ └── types.ts
│ │ ├── storage/
│ │ │ ├── index.ts
│ │ │ └── local-storage.ts
│ │ ├── validation/
│ │ │ ├── index.ts
│ │ │ └── schemas.ts # Zod схемы
│ │ ├── utils/
│ │ │ ├── index.ts
│ │ │ ├── format.ts
│ │ │ └── constants.ts
│ │ └── hooks/
│ │ ├── index.ts
│ │ ├── use-debounce.ts
│ │ └── use-local-storage.ts
│ ├── config/ # Конфигурация
│ │ ├── index.ts
│ │ ├── api.ts
│ │ └── routes.ts
│ └── store/ # Конфигурация Reatom
│ ├── index.ts
│ ├── ctx.ts # Reatom контекст
│ ├── cart.ts # Был добавлен!!!!!!
│ └── persist.ts # Настройки персистентности
│
├── main.tsx # Точка входа
└── vite-env.d.ts # Типы для Vite
