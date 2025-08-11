import { API_BASE_URL, API_CONFIG, buildQueryParams } from '@/shared/config/api';
import type { Product, PaginationParams } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${this.baseUrl}${endpoint}`;
      // eslint-disable-next-line no-console
      console.log('🌐 API запрос:', url);
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`❌ HTTP ошибка: ${response.status} для ${url}`);
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status,
          response
        );
      }

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log('📦 Ответ API:', data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if ((error as Error).name === 'AbortError') {
        throw new ApiError('Request timeout');
      }
      
      console.error('❌ Сетевая ошибка:', error);
      throw new ApiError('Network error');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Специальный метод для запросов с query параметрами
  async getWithParams<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const queryString = buildQueryParams(params || {});
    return this.get<T>(`${endpoint}${queryString}`);
  }

  // Метод для загрузки товаров каталога
  async getItems(params: PaginationParams = {}): Promise<Product[]> {
    const queryParams: Record<string, string | number | undefined> = {
      offset: params.offset,
      categoryId: params.categoryId,
      q: params.q
    };
    return this.getWithParams<Product[]>('/api/items', queryParams);
  }

  // Метод для загрузки товара по ID - простая интерполяция
  async getProduct(id: number): Promise<Product> {
    return this.get<Product>(`/api/items/${id}`);
  }

  // Метод для загрузки топ продаж
  async getTopSales(): Promise<Product[]> {
    return this.get<Product[]>('/api/top-sales');
  }

  // Метод для загрузки категорий
  async getCategories(): Promise<Array<{ id: number; title: string }>> {
    return this.get<Array<{ id: number; title: string }>>('/api/categories');
  }

  // Метод для отправки заказа
  async createOrder(orderData: {
    owner: {
      phone: string;
      address: string;
    };
    items: Array<{
      id: number;
      price: number;
      count: number;
    }>;
  }): Promise<{ id: number }> {
    return this.post<{ id: number }>('/api/order', orderData);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);