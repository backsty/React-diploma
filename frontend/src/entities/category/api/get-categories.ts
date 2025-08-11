import { apiClient } from '@/shared/lib/api';
import type { Category } from '../model/types';

/**
 * Получение списка категорий с сервера
 * GET /api/categories
 * 
 * @returns Promise<Category[]> - Массив категорий
 * @throws ApiError - При ошибке запроса
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categories = await apiClient.get<Category[]>('/api/categories');
    
    // Валидация данных от сервера
    if (!Array.isArray(categories)) {
      throw new Error('Сервер вернул некорректный формат данных категорий');
    }
    
    // Проверяем структуру каждой категории
    const validCategories = categories.filter((category): category is Category => {
      return (
        typeof category === 'object' &&
        category !== null &&
        typeof category.id === 'number' &&
        typeof category.title === 'string' &&
        category.title.trim().length > 0
      );
    });
    
    return validCategories;
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
    
    if (error instanceof Error) {
      throw new Error(`Не удалось загрузить категории: ${error.message}`);
    }
    
    throw new Error('Неизвестная ошибка при загрузке категорий');
  }
};

/**
 * Получение категории по ID (для валидации)
 * 
 * @param categoryId - ID категории
 * @returns Promise<Category | null> - Категория или null если не найдена
 */
export const getCategoryById = async (categoryId: number): Promise<Category | null> => {
  try {
    const categories = await getCategories();
    return categories.find(category => category.id === categoryId) || null;
  } catch (error) {
    console.error('Ошибка поиска категории по ID:', error);
    return null;
  }
};

/**
 * Проверка существования категории
 * 
 * @param categoryId - ID категории для проверки
 * @returns Promise<boolean> - true если категория существует
 */
export const validateCategoryExists = async (categoryId: number): Promise<boolean> => {
  if (categoryId === 0) {
    // Категория "Все" всегда существует
    return true;
  }
  
  try {
    const category = await getCategoryById(categoryId);
    return category !== null;
  } catch {
    return false;
  }
};