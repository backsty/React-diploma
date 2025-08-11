import { apiClient } from '@/shared/lib/api';
import type { Category } from '@/shared/lib/api';

export const getCategories = async (): Promise<Category[]> => {
  return apiClient.get<Category[]>('/api/categories');
};

// Утилита для добавления категории "Все"
export const getCategoriesWithAll = async (): Promise<Category[]> => {
  const categories = await getCategories();
  
  // Добавляем категорию "Все" в начало списка
  const allCategory: Category = {
    id: 0,
    title: 'Все'
  };
  
  return [allCategory, ...categories];
};