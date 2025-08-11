// Определяем базовый URL для API в зависимости от окружения
const getApiBaseUrl = (): string => {
  // В production используем переменную окружения для продакшена
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_PROD_API_BASE_URL || 'https://react-diploma-backend.onrender.com';
  }
  
  // В development используем локальный сервер
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:7070';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  TOP_SALES: '/api/top-sales',
  CATEGORIES: '/api/categories',
  ITEMS: '/api/items',
  ITEM: '/api/items/:id',
  ORDER: '/api/order',
  HEALTH: '/health'
} as const;

export const API_CONFIG = {
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000', 10),
  ITEMS_PER_PAGE: parseInt(import.meta.env.VITE_CATALOG_ITEMS_PER_PAGE || '6', 10),
  SEARCH_DEBOUNCE: parseInt(import.meta.env.VITE_SEARCH_DEBOUNCE_MS || '500', 10),
  SEARCH_MIN_LENGTH: parseInt(import.meta.env.VITE_SEARCH_MIN_LENGTH || '1', 10),
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
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
  const requiredEnvVars = import.meta.env.PROD 
    ? ['VITE_PROD_API_BASE_URL'] 
    : ['VITE_API_BASE_URL'];
    
  const missing = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Отсутствуют переменные окружения:', missing);
  }
  
  if (API_CONFIG.TIMEOUT < 1000) {
    console.warn('⚠️ Слишком маленький таймаут API:', API_CONFIG.TIMEOUT);
  }
  
  // Проверяем доступность API
  if (import.meta.env.PROD) {
    checkApiHealth();
  }
  
  return missing.length === 0;
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 секунд таймаут
    });
    
    if (response.ok) {
      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log('✅ API Health Check OK:', data);
      return true;
    } else {
      console.warn('⚠️ API Health Check Failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API Health Check Error:', error);
    return false;
  }
};

export const getFullApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const processedEndpoint = params ? buildApiUrl(endpoint, params) : endpoint;
  return `${API_BASE_URL}${processedEndpoint}`;
};

export const createApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = getFullApiUrl(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
export type ApiConfigKey = keyof typeof API_CONFIG;

export const STORAGE_KEYS = {
  CART: import.meta.env.VITE_CART_STORAGE_KEY || 'bosa-noga-cart',
  USER_PREFERENCES: 'bosa-noga-preferences',
  SEARCH_HISTORY: 'bosa-noga-search-history'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
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
  
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('🔧 API Configuration:', {
      mode: import.meta.env.MODE,
      baseUrl: API_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      itemsPerPage: API_CONFIG.ITEMS_PER_PAGE,
      isValid,
      environment: import.meta.env.PROD ? 'production' : 'development'
    });
  }
};

// Автоматическая инициализация
initializeApi();