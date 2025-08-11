import { apiClient } from '@/shared/lib/api';
import type { Product, ProductPreview, ProductsQuery } from '../model/types';

export const getProduct = async (id: number): Promise<Product> => {
  try {
    // eslint-disable-next-line no-console
    console.log('🔍 Загружаем товар с ID:', id);
    
    const product = await apiClient.get<Product>(`/api/items/${id}`);
    
    if (!product || typeof product.id !== 'number') {
      throw new Error('Сервер вернул некорректные данные товара');
    }
    
    if (!product.title || !Array.isArray(product.images)) {
      throw new Error('Товар не содержит необходимых данных');
    }
    
    if (!Array.isArray(product.sizes)) {
      console.warn('⚠️ Товар без размеров:', product.title);
      product.sizes = [];
    } else {
      // Нормализуем размеры
      product.sizes = product.sizes.map(size => ({
        size: String(size.size || size),
        available: Boolean(size.available !== false)
      }));
    }

    // eslint-disable-next-line no-console
    console.log(`📏 Размеры товара "${product.title}":`, {
      total: product.sizes.length,
      available: product.sizes.filter(s => s.available).length,
      sizes: product.sizes
    });
    
    return product;
  } catch (error) {
    console.error('❌ Ошибка получения товара:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error(`Товар с ID ${id} не найден`);
      }
      throw new Error(`Не удалось загрузить товар: ${error.message}`);
    }
    
    throw new Error('Неизвестная ошибка при загрузке товара');
  }
};

// Остальные функции без изменений...
export const getProducts = async (params: ProductsQuery = {}): Promise<ProductPreview[]> => {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.categoryId && params.categoryId > 0) {
      searchParams.append('categoryId', params.categoryId.toString());
    }
    
    if (params.q?.trim()) {
      searchParams.append('q', params.q.trim());
    }
    
    if (params.offset && params.offset > 0) {
      searchParams.append('offset', params.offset.toString());
    }
    
    const query = searchParams.toString();
    const endpoint = query ? `/api/items?${query}` : '/api/items';
    
    const products = await apiClient.get<ProductPreview[]>(endpoint);
    
    if (!Array.isArray(products)) {
      throw new Error('Сервер вернул некорректный формат данных');
    }
    
    const validProducts = products.filter((product): product is ProductPreview => {
      return (
        typeof product === 'object' &&
        product !== null &&
        typeof product.id === 'number' &&
        typeof product.title === 'string' &&
        typeof product.price === 'number' &&
        Array.isArray(product.images) &&
        product.title.trim().length > 0 &&
        product.price > 0
      );
    });
    
    return validProducts;
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    
    if (error instanceof Error) {
      throw new Error(`Не удалось загрузить товары: ${error.message}`);
    }
    
    throw new Error('Неизвестная ошибка при загрузке товаров');
  }
};

export const getTopSales = async (): Promise<ProductPreview[]> => {
  try {
    const topSales = await apiClient.get<ProductPreview[]>('/api/top-sales');
    
    if (!Array.isArray(topSales)) {
      throw new Error('Сервер вернул некорректный формат данных для топ продаж');
    }
    
    const validTopSales = topSales.filter((product): product is ProductPreview => {
      return (
        typeof product === 'object' &&
        product !== null &&
        typeof product.id === 'number' &&
        typeof product.title === 'string' &&
        typeof product.price === 'number' &&
        Array.isArray(product.images) &&
        product.title.trim().length > 0 &&
        product.price > 0
      );
    });
    
    return validTopSales;
  } catch (error) {
    console.error('Ошибка загрузки топ продаж:', error);
    
    if (error instanceof Error) {
      throw new Error(`Не удалось загрузить топ продаж: ${error.message}`);
    }
    
    throw new Error('Неизвестная ошибка при загрузке топ продаж');
  }
};

export const searchProducts = async (
  query: string, 
  categoryId?: number
): Promise<ProductPreview[]> => {
  const searchQuery: ProductsQuery = {
    q: query.trim(),
    offset: 0
  };
  
  if (categoryId && categoryId > 0) {
    searchQuery.categoryId = categoryId;
  }
  
  return getProducts(searchQuery);
};

export const loadMoreProducts = async (
  currentQuery: ProductsQuery,
  currentOffset: number
): Promise<ProductPreview[]> => {
  return getProducts({
    ...currentQuery,
    offset: currentOffset
  });
};

export const checkProductExists = async (id: number): Promise<boolean> => {
  try {
    await getProduct(id);
    return true;
  } catch {
    return false;
  }
};