export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7070';

export const API_ENDPOINTS = {
  TOP_SALES: '/api/top-sales',
  CATEGORIES: '/api/categories',
  ITEMS: '/api/items',
  ITEM: '/api/items/:id',
  ORDER: '/api/order'
} as const;

export const API_CONFIG = {
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  ITEMS_PER_PAGE: parseInt(import.meta.env.VITE_CATALOG_ITEMS_PER_PAGE || '6', 10),
  SEARCH_DEBOUNCE: parseInt(import.meta.env.VITE_SEARCH_DEBOUNCE_MS || '500', 10),
  SEARCH_MIN_LENGTH: parseInt(import.meta.env.VITE_SEARCH_MIN_LENGTH || '1', 10)
} as const;

export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = endpoint;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const encodedValue = String(value);
        url = url.replace(`:${key}`, encodedValue);
      }
    });
  }
  
  if (url.includes(':')) {
    console.warn('⚠️ Не все параметры заменены в URL:', url);
  }
  
  return url;
};

export const buildQueryParams = (params: Record<string, string | number | undefined>): string => {
  const validParams = Object.entries(params)
    .filter(([_, value]) => {
      return value !== undefined && 
             value !== null && 
             value !== '' && 
             String(value).trim() !== '';
    })
    .map(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(String(value));
      return `${encodedKey}=${encodedValue}`;
    })
    .join('&');
    
  return validParams ? `?${validParams}` : '';
};

export const validateApiConfig = (): boolean => {
  const requiredEnvVars = ['VITE_API_BASE_URL'];
  const missing = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Отсутствуют переменные окружения:', missing);
  }
  
  if (API_CONFIG.TIMEOUT < 1000) {
    console.warn('⚠️ Слишком маленький таймаут API:', API_CONFIG.TIMEOUT);
  }
  
  return missing.length === 0;
};

export const getFullApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const processedEndpoint = params ? buildApiUrl(endpoint, params) : endpoint;
  return `${API_BASE_URL}${processedEndpoint}`;
};

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type ApiConfigKey = keyof typeof API_CONFIG;

export const STORAGE_KEYS = {
  CART: 'bosa-noga-cart',
  USER_PREFERENCES: 'bosa-noga-preferences',
  SEARCH_HISTORY: 'bosa-noga-search-history'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export const getProductEndpoint = (id: number): string => {
  return buildApiUrl(API_ENDPOINTS.ITEM, { id });
};

export const getItemsEndpoint = (params?: Record<string, string | number | undefined>): string => {
  const endpoint = API_ENDPOINTS.ITEMS;
  return params ? `${endpoint}${buildQueryParams(params)}` : endpoint;
};

export const initializeApi = (): void => {
  const isValid = validateApiConfig();
  
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('🔧 API Configuration:', {
      baseUrl: API_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      itemsPerPage: API_CONFIG.ITEMS_PER_PAGE,
      isValid
    });
  }
};

// Автоматическая инициализация в development режиме
if (process.env.NODE_ENV === 'development') {
  initializeApi();
}