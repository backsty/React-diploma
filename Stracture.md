frontend/
├── public/
│   ├── index.html                  # Основной HTML для React приложения
│   ├── favicon.ico                 # Иконка сайта
│   └── manifest.json               # PWA манифест
├── src/
│   ├── components/                 # Переиспользуемые UI компоненты
│   │   ├── Banner/
│   │   │   └── Banner.tsx          # ТЗ: статичный рекламный баннер на главной
│   │   ├── Cart/
│   │   │   ├── CartItem.tsx        # ТЗ: одна позиция в корзине (товар + размер)
│   │   │   ├── CartList.tsx        # ТЗ: список всех товаров в корзине
│   │   │   ├── CartSummary.tsx     # ТЗ: блок с общей суммой заказа
│   │   │   └── CartWidget.tsx      # ТЗ: иконка корзины в шапке с количеством позиций
│   │   ├── Catalog/
│   │   │   ├── CategoryFilter.tsx  # ТЗ: фильтр по категориям + добавление "Все"
│   │   │   ├── LoadMoreButton.tsx  # ТЗ: кнопка "Загрузить ещё" (по 6 товаров)
│   │   │   ├── ProductCard.tsx     # ТЗ: карточка товара в каталоге
│   │   │   ├── ProductList.tsx     # ТЗ: сетка товаров с пагинацией
│   │   │   └── SearchForm.tsx      # ТЗ: форма поиска только на странице каталога
│   │   ├── Header/
│   │   │   ├── Header.tsx          # ТЗ: шапка сайта с навигацией и поиском
│   │   │   ├── Navigation.tsx      # ТЗ: меню (Главная, Каталог, О магазине, Контакты)
│   │   │   └── SearchWidget.tsx    # ТЗ: глобальный поиск (иконка → поле → переход в каталог)
│   │   ├── Footer/
│   │   │   └── Footer.tsx          # ТЗ: футер с дублированием основных ссылок
│   │   ├── Product/
│   │   │   ├── ProductImages.tsx   # ТЗ: отображение первой картинки из массива images
│   │   │   ├── ProductInfo.tsx     # ТЗ: табличка с данными товара (артикул, производитель и тд)
│   │   │   ├── QuantitySelector.tsx # ТЗ: выбор количества от 1 до 10
│   │   │   └── SizeSelector.tsx    # ТЗ: выбор размера (только available=true)
│   │   ├── Order/
│   │   │   ├── OrderForm.tsx       # ТЗ: форма оформления заказа (телефон, адрес, согласие)
│   │   │   └── OrderSuccess.tsx    # ТЗ: сообщение об успешном оформлении заказа
│   │   ├── TopSales/
│   │   │   └── TopSales.tsx        # ТЗ: компонент "Хиты продаж" на главной
│   │   └── UI/
│   │       ├── ErrorMessage.tsx    # ТЗ: обработка ошибок сервера/сети
│   │       ├── Layout.tsx          # Общий layout с Header и Footer
│   │       └── Loader.tsx          # ТЗ: индивидуальные лоадеры для каждого блока
│   ├── pages/                      # Страницы-контейнеры (Routes)
│   │   ├── AboutPage.tsx           # ТЗ: /about.html - статичная страница "О магазине"
│   │   ├── CartPage.tsx            # ТЗ: /cart.html - корзина и оформление заказа
│   │   ├── CatalogPage.tsx         # ТЗ: /catalog.html - каталог с поиском и фильтрами
│   │   ├── ContactsPage.tsx        # ТЗ: /contacts.html - статичная страница "Контакты"
│   │   ├── HomePage.tsx            # ТЗ: / - главная (баннер + хиты + каталог)
│   │   ├── NotFoundPage.tsx        # ТЗ: 404.html - страница ошибки 404
│   │   └── ProductPage.tsx         # ТЗ: /catalog/:id.html - детальная страница товара
│   ├── store/                      # Reatom state management
│   │   ├── atoms/                  # Атомы состояния
│   │   │   ├── cartAtom.ts         # ТЗ: корзина в localStorage (позиция = товар + размер)
│   │   │   ├── catalogAtom.ts      # ТЗ: состояние каталога (товары, пагинация, фильтры)
│   │   │   ├── categoriesAtom.ts   # ТЗ: категории товаров + добавление "Все"
│   │   │   ├── currentProductAtom.ts # ТЗ: текущий просматриваемый товар
│   │   │   ├── orderAtom.ts        # ТЗ: состояние процесса оформления заказа
│   │   │   ├── searchAtom.ts       # ТЗ: глобальный поиск из шапки
│   │   │   └── topSalesAtom.ts     # ТЗ: хиты продаж на главной
│   │   ├── effects/                # Побочные эффекты (API запросы)
│   │   │   ├── categoriesEffect.ts # GET /api/categories
│   │   │   ├── itemsEffect.ts      # GET /api/items (с параметрами offset, categoryId, q)
│   │   │   ├── productEffect.ts    # GET /api/items/:id
│   │   │   ├── orderEffect.ts      # POST /api/order
│   │   │   └── topSalesEffect.ts   # GET /api/top-sales
│   │   └── index.ts                # Конфигурация Reatom context
│   ├── types/                      # TypeScript типы
│   │   ├── api.ts                  # Типы для API ответов и запросов
│   │   ├── cart.ts                 # Типы для корзины (CartItem, CartState)
│   │   ├── product.ts              # Типы для товаров (Product, ProductSize)
│   │   ├── category.ts             # Типы для категорий (Category)
│   │   ├── order.ts                # Типы для заказа (OrderData, OrderOwner)
│   │   └── common.ts               # Общие типы (LoadingState, ErrorState)
│   ├── services/                   # HTTP клиенты и API
│   │   ├── api.ts                  # Базовый HTTP клиент (fetch с базовым URL)
│   │   └── endpoints.ts            # Константы всех 5 API endpoints из ТЗ
│   ├── hooks/                      # Кастомные React хуки
│   │   ├── useCart.ts              # ТЗ: логика корзины (добавить, удалить, изменить количество)
│   │   ├── useDebounce.ts          # ТЗ: дебаунс для поиска (не live-поиск)
│   │   └── useLocalStorage.ts      # ТЗ: синхронизация состояния с localStorage
│   ├── utils/                      # Вспомогательные утилиты
│   │   ├── cartHelpers.ts          # ТЗ: расчеты корзины (общая сумма, количество позиций)
│   │   ├── constants.ts            # ТЗ: все константы (пути URL, ключи localStorage)
│   │   ├── priceHelpers.ts         # ТЗ: форматирование цен ("34 000 руб")
│   │   └── validators.ts           # ТЗ: валидация формы заказа
│   ├── router/                     # Роутинг
│   │   ├── AppRouter.tsx           # ТЗ: настройка React Router для всех страниц
│   │   └── routes.ts               # ТЗ: константы путей из технического задания
│   ├── htmlTemplates/              # HTML шаблоны (точные копии из html/)
│   │   ├── 404.html                # Шаблон страницы 404
│   │   ├── about.html              # Шаблон страницы "О магазине"
│   │   ├── cart.html               # Шаблон страницы корзины
│   │   ├── catalog.html            # Шаблон страницы каталога
│   │   ├── contacts.html           # Шаблон страницы контактов
│   │   ├── index.html              # Шаблон главной страницы (загрузка)
│   │   ├── index-loaded.html       # Шаблон главной страницы (загружено)
│   │   └── products/
│   │       └── 1.html              # Шаблон страницы товара
│   ├── assets/                     # Статичные файлы (точные копии из html/)
│   │   ├── css/
│   │   │   └── style.css           # ТЗ: готовые стили (копия html/css/style.css)
│   │   └── img/                    # ТЗ: изображения (копия html/img/)
│   │       ├── banner.jpg          # Изображение баннера
│   │       ├── footer-sprite.png   # Спрайт футера
│   │       ├── header-controls-sprite.png # Спрайт элементов шапки
│   │       ├── header-logo.png     # Логотип в шапке
│   │       └── products/           # Изображения товаров
│   ├── App.tsx                     # Главный компонент приложения с Reatom Provider
│   └── index.tsx                   # Точка входа React приложения
├── tsconfig.json                   # Конфигурация TypeScript
├── package.json                    # Зависимости и скрипты проекта
└── README.md                       # Документация проекта