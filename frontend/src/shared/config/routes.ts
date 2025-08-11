export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: '/catalog/:id',
  CART: '/cart',
  ABOUT: '/about',
  CONTACTS: '/contacts',
  NOT_FOUND: '/404'
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];

export const getProductRoute = (id: number | string): string => {
  // Добавляем валидацию
  if (!id || id === ':id') {
    console.error('❌ Некорректный ID товара:', id);
    return '/catalog';
  }
  return `/catalog/${id}`;
};

// Хелпер для парсинга ID товара из URL
export const parseProductId = (pathname: string): number | null => {
  const match = pathname.match(/^\/catalog\/(\d+)$/);
  return match && match[1] !== undefined ? parseInt(match[1], 10) : null;
};

// Хелпер для построения URL каталога с параметрами
export const getCatalogRoute = (params?: { q?: string; categoryId?: number }): string => {
  const baseUrl = ROUTES.CATALOG;
  
  if (!params) return baseUrl;
  
  const queryParams: Record<string, string> = {};
  
  if (params.q) {
    queryParams.q = params.q;
  }
  
  if (params.categoryId) {
    queryParams.categoryId = String(params.categoryId);
  }
  
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
    
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Хелпер для проверки, является ли путь страницей товара
export const isProductRoute = (pathname: string): boolean => {
  return /^\/catalog\/\d+$/.test(pathname);
};

// Функция для проверки активного роута
export const isActiveRoute = (currentPath: string, targetPath: string): boolean => {
  // Точное совпадение для главной страницы
  if (targetPath === ROUTES.HOME) {
    return currentPath === ROUTES.HOME;
  }
  
  // Для каталога проверяем начало пути
  if (targetPath === ROUTES.CATALOG) {
    return currentPath === ROUTES.CATALOG || currentPath.startsWith('/catalog');
  }
  
  // Для остальных страниц - точное совпадение
  return currentPath === targetPath;
};

// Названия страниц для title
export const PAGE_TITLES = {
  [ROUTES.HOME]: 'Главная - Bosa Noga',
  [ROUTES.CATALOG]: 'Каталог - Bosa Noga',
  [ROUTES.ABOUT]: 'О магазине - Bosa Noga',
  [ROUTES.CONTACTS]: 'Контакты - Bosa Noga',
  [ROUTES.CART]: 'Корзина - Bosa Noga',
  [ROUTES.PRODUCT]: 'Товар - Bosa Noga',
  [ROUTES.NOT_FOUND]: 'Страница не найдена - Bosa Noga'
} as const;

// Функция для получения title страницы
export const getPageTitle = (pathname: string): string => {
  // Проверяем конкретные роуты
  if (pathname === ROUTES.HOME) return PAGE_TITLES[ROUTES.HOME];
  if (pathname === ROUTES.CATALOG) return PAGE_TITLES[ROUTES.CATALOG];
  if (pathname === ROUTES.ABOUT) return PAGE_TITLES[ROUTES.ABOUT];
  if (pathname === ROUTES.CONTACTS) return PAGE_TITLES[ROUTES.CONTACTS];
  if (pathname === ROUTES.CART) return PAGE_TITLES[ROUTES.CART];
  
  // Проверяем динамические роуты
  if (isProductRoute(pathname)) {
    const productId = parseProductId(pathname);
    return productId ? `Товар #${productId} - Bosa Noga` : PAGE_TITLES[ROUTES.PRODUCT];
  }
  
  // Для всех остальных случаев
  return PAGE_TITLES[ROUTES.NOT_FOUND];
};

// Тип для навигационной ссылки
export interface NavigationLink {
  to: string;
  label: string;
}

// Дополнительные хелперы для навигации
export const getNavigationLinks = (): NavigationLink[] => [
  { to: ROUTES.HOME, label: 'Главная' },
  { to: ROUTES.CATALOG, label: 'Каталог' },
  { to: ROUTES.ABOUT, label: 'О магазине' },
  { to: ROUTES.CONTACTS, label: 'Контакты' },
];

// Хелпер для получения названия текущей страницы
export const getCurrentPageName = (pathname: string): string => {
  if (pathname === ROUTES.HOME) return 'Главная';
  if (pathname === ROUTES.CATALOG) return 'Каталог';
  if (pathname === ROUTES.ABOUT) return 'О магазине';
  if (pathname === ROUTES.CONTACTS) return 'Контакты';
  if (pathname === ROUTES.CART) return 'Корзина';
  if (isProductRoute(pathname)) return 'Товар';
  return 'Страница не найдена';
};

// Константы для валидации роутов
export const VALID_ROUTES = Object.values(ROUTES);

// Хелпер для проверки валидности роута
export const isValidRoute = (pathname: string): boolean => {
  return VALID_ROUTES.some(route => {
    if (route.includes(':')) {
      const pattern = route.replace(':id', '\\d+');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return route === pathname;
  });
};

// Хелперы для мета-данных страниц
export const getPageMeta = (pathname: string) => {
  const title = getPageTitle(pathname);
  const pageName = getCurrentPageName(pathname);
  
  return {
    title,
    pageName,
    isProductPage: isProductRoute(pathname),
    isValidPage: isValidRoute(pathname)
  };
};

// Константы для мета-описаний
export const PAGE_DESCRIPTIONS = {
  [ROUTES.HOME]: 'Интернет-магазин качественной обуви Bosa Noga. Широкий ассортимент обуви для всей семьи.',
  [ROUTES.CATALOG]: 'Каталог обуви в магазине Bosa Noga. Найдите идеальную пару обуви для любого случая.',
  [ROUTES.ABOUT]: 'О магазине Bosa Noga. Наша история, принципы работы и преимущества.',
  [ROUTES.CONTACTS]: 'Контактная информация магазина Bosa Noga. Адрес, телефон, режим работы.',
  [ROUTES.CART]: 'Корзина покупок в магазине Bosa Noga. Оформление заказа и доставка.',
  [ROUTES.PRODUCT]: 'Детальная информация о товаре в магазине Bosa Noga.',
  [ROUTES.NOT_FOUND]: 'Страница не найдена на сайте Bosa Noga.'
} as const;

// Функция для получения описания страницы
export const getPageDescription = (pathname: string): string => {
  if (pathname === ROUTES.HOME) return PAGE_DESCRIPTIONS[ROUTES.HOME];
  if (pathname === ROUTES.CATALOG) return PAGE_DESCRIPTIONS[ROUTES.CATALOG];
  if (pathname === ROUTES.ABOUT) return PAGE_DESCRIPTIONS[ROUTES.ABOUT];
  if (pathname === ROUTES.CONTACTS) return PAGE_DESCRIPTIONS[ROUTES.CONTACTS];
  if (pathname === ROUTES.CART) return PAGE_DESCRIPTIONS[ROUTES.CART];
  if (isProductRoute(pathname)) return PAGE_DESCRIPTIONS[ROUTES.PRODUCT];
  return PAGE_DESCRIPTIONS[ROUTES.NOT_FOUND];
};