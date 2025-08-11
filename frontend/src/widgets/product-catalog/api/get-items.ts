import { apiClient } from '@/shared/lib/api';
import type { ProductPreview } from '@/entities/product';

export interface GetItemsParams {
  categoryId?: number | null;
  q?: string;
  offset?: number;
  limit?: number;
}

interface ApiProductItem {
  id: unknown;
  title: unknown;
  price: unknown;
  images: unknown;
  category?: unknown;
}

const isValidProductPreview = (item: ApiProductItem): item is ProductPreview => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'number' &&
    typeof item.title === 'string' &&
    typeof item.price === 'number' &&
    Array.isArray(item.images)
  );
};

export const getItems = async (params: GetItemsParams = {}): Promise<ProductPreview[]> => {
  try {
    const searchParams = new URLSearchParams();
    
    // Категория (если не "Все категории")
    if (params.categoryId && params.categoryId > 0) {
      searchParams.append('categoryId', params.categoryId.toString());
    }
    
    // Поисковый запрос
    if (params.q && params.q.trim()) {
      searchParams.append('q', params.q.trim());
    }
    
    // Пагинация
    if (params.offset && params.offset > 0) {
      searchParams.append('offset', params.offset.toString());
    }
    
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    
    const url = `/api/items${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    if (process.env.NODE_ENV === 'development') {
      console.warn('🌐 API запрос:', url);
      console.warn('📝 Параметры поиска:', params);
    }
    
    const response = await apiClient.get<ProductPreview[]>(url);
    
    if (!Array.isArray(response)) {
      throw new Error('Неверный формат ответа API');
    }
    
    // Фильтрация по поисковому запросу на клиенте для надежности
    let filteredItems = response;
    
    if (params.q && params.q.trim()) {
      const searchTerm = params.q.trim().toLowerCase();
      filteredItems = response.filter((item: ProductPreview) => {
        return item.title.toLowerCase().includes(searchTerm);
      });
    }

    const validItems = filteredItems.filter((item: ApiProductItem): item is ProductPreview => {
      return isValidProductPreview(item);
    });

    if (process.env.NODE_ENV === 'development') {
      console.warn('✅ Возвращаем товары:', validItems.length);
    }
    
    return validItems;
  } catch (error) {
    console.error('❌ Ошибка получения товаров:', error);
    
    if (error instanceof Error) {
      throw new Error(`Не удалось загрузить товары: ${error.message}`);
    }
    
    throw new Error('Неизвестная ошибка при загрузке товаров');
  }
};

export const loadMoreItems = async (params: GetItemsParams): Promise<ProductPreview[]> => {
  return getItems(params);
};