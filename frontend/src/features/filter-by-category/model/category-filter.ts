import { atom, action, Ctx } from '@reatom/core';
import { 
  validateCategoryExists,
  ALL_CATEGORIES_ID 
} from '@/entities/category';
import { apiClient } from '@/shared/lib';
import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';

// Состояние фильтрации по категориям
export interface CategoryFilterState {
  selectedCategoryId: number;
  isLoading: boolean;
  error: string | null;
  filteredProducts: Product[];
  totalCount: number;
  hasMore: boolean;
  currentOffset: number;
}

// Параметры для фильтрации товаров
export interface FilterProductsParams {
  categoryId: number;
  offset?: number;
  searchQuery?: string | undefined;
  resetResults?: boolean;
}

// Состояние истории фильтрации
export interface CategoryFilterHistory {
  lastSelectedCategory: number;
  recentCategories: number[];
}

// Атом состояния фильтрации по категориям
export const categoryFilterAtom = atom<CategoryFilterState>({
  selectedCategoryId: ALL_CATEGORIES_ID,
  isLoading: false,
  error: null,
  filteredProducts: [],
  totalCount: 0,
  hasMore: true,
  currentOffset: 0
}, 'categoryFilter');

// Атом истории фильтрации
export const categoryFilterHistoryAtom = atom<CategoryFilterHistory>({
  lastSelectedCategory: ALL_CATEGORIES_ID,
  recentCategories: []
}, 'categoryFilterHistory');

// Action для начала фильтрации
export const startCategoryFilterAction = action((ctx: Ctx) => {
  const current = ctx.get(categoryFilterAtom);
  categoryFilterAtom(ctx, { 
    ...current, 
    isLoading: true, 
    error: null 
  });
}, 'startCategoryFilter');

// Action для установки результатов фильтрации
export const setCategoryFilterResultsAction = action((
  ctx: Ctx, 
  products: Product[], 
  totalCount: number,
  hasMore: boolean,
  append: boolean = false
) => {
  const current = ctx.get(categoryFilterAtom);
  const newProducts = append ? [...current.filteredProducts, ...products] : products;
  
  categoryFilterAtom(ctx, {
    ...current,
    isLoading: false,
    error: null,
    filteredProducts: newProducts,
    totalCount,
    hasMore,
    currentOffset: append ? current.currentOffset + products.length : products.length
  });
}, 'setCategoryFilterResults');

// Action для ошибки фильтрации
export const setCategoryFilterErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(categoryFilterAtom);
  categoryFilterAtom(ctx, {
    ...current,
    isLoading: false,
    error
  });
}, 'setCategoryFilterError');

// Action для смены выбранной категории
export const setSelectedCategoryAction = action((ctx: Ctx, categoryId: number) => {
  const current = ctx.get(categoryFilterAtom);
  
  // Обновляем выбранную категорию и сбрасываем результаты
  categoryFilterAtom(ctx, {
    ...current,
    selectedCategoryId: categoryId,
    filteredProducts: [],
    totalCount: 0,
    hasMore: true,
    currentOffset: 0,
    error: null
  });
  
  // Обновляем историю
  updateCategoryHistoryAction(ctx, categoryId);
}, 'setSelectedCategory');

// Основной action для фильтрации товаров по категории
export const filterProductsByCategoryAction = action(async (
  ctx: Ctx, 
  params: FilterProductsParams
) => {
  try {
    const { categoryId, offset = 0, searchQuery, resetResults = true } = params;
    
    // Валидация категории
    if (categoryId !== ALL_CATEGORIES_ID) {
      const isValidCategory = await validateCategoryExists(categoryId);
      if (!isValidCategory) {
        setCategoryFilterErrorAction(ctx, 'Категория не найдена');
        return { success: false, error: 'Категория не найдена' };
      }
    }
    
    // Начинаем загрузку
    startCategoryFilterAction(ctx);
    
    // Формируем параметры запроса
    const queryParams: Record<string, string | number | undefined> = {
      offset,
      categoryId: categoryId === ALL_CATEGORIES_ID ? undefined : categoryId
    };
    
    // Добавляем поисковый запрос если есть
    if (searchQuery && searchQuery.trim()) {
      queryParams.q = searchQuery.trim();
    }
    
    // Выполняем запрос к API
    const products = await apiClient.getWithParams<Product[]>('/api/items', queryParams);
    
    // Определяем есть ли еще товары (если пришло меньше чем ожидали - значит закончились)
    const hasMore = products.length >= 6; // API возвращает по 6 товаров
    
    // Обновляем выбранную категорию если это новая фильтрация
    if (resetResults) {
      setSelectedCategoryAction(ctx, categoryId);
    }
    
    // Устанавливаем результаты
    setCategoryFilterResultsAction(ctx, products, products.length, hasMore, !resetResults);
    
    return { 
      success: true, 
      products, 
      totalCount: products.length,
      hasMore 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка фильтрации товаров';
    setCategoryFilterErrorAction(ctx, errorMessage);
    
    return { success: false, error: errorMessage };
  }
}, 'filterProductsByCategory');

// Action для загрузки дополнительных товаров (Load More)
export const loadMoreProductsAction = action(async (ctx: Ctx, searchQuery?: string) => {
  const current = ctx.get(categoryFilterAtom);
  
  if (!current.hasMore || current.isLoading) {
    return { success: false, error: 'Нет больше товаров для загрузки' };
  }
  
  return await filterProductsByCategoryAction(ctx, {
    categoryId: current.selectedCategoryId,
    offset: current.currentOffset,
    searchQuery: searchQuery,
    resetResults: false
  });
}, 'loadMoreProducts');

// Action для сброса фильтрации
export const resetCategoryFilterAction = action((ctx: Ctx) => {
  categoryFilterAtom(ctx, {
    selectedCategoryId: ALL_CATEGORIES_ID,
    isLoading: false,
    error: null,
    filteredProducts: [],
    totalCount: 0,
    hasMore: true,
    currentOffset: 0
  });
}, 'resetCategoryFilter');

// Action для обновления истории категорий
export const updateCategoryHistoryAction = action((ctx: Ctx, categoryId: number) => {
  const current = ctx.get(categoryFilterHistoryAtom);
  
  // Добавляем в начало списка, убирая дубликаты
  const newRecentCategories = [
    categoryId,
    ...current.recentCategories.filter(id => id !== categoryId)
  ].slice(0, 5); // Храним только последние 5 категорий
  
  categoryFilterHistoryAtom(ctx, {
    lastSelectedCategory: categoryId,
    recentCategories: newRecentCategories
  });
}, 'updateCategoryHistory');

// Action для очистки истории
export const clearCategoryHistoryAction = action((ctx: Ctx) => {
  categoryFilterHistoryAtom(ctx, {
    lastSelectedCategory: ALL_CATEGORIES_ID,
    recentCategories: []
  });
}, 'clearCategoryHistory');

// Селекторы
export const categoryFilterSelector = atom((ctx) => {
  return ctx.spy(categoryFilterAtom);
}, 'categoryFilterSelector');

export const selectedCategoryIdAtom = atom((ctx) => {
  const state = ctx.spy(categoryFilterAtom);
  return state.selectedCategoryId;
}, 'selectedCategoryId');

export const filteredProductsAtom = atom((ctx) => {
  const state = ctx.spy(categoryFilterAtom);
  return state.filteredProducts;
}, 'filteredProducts');

export const categoryFilterLoadingAtom = atom((ctx) => {
  const state = ctx.spy(categoryFilterAtom);
  return state.isLoading;
}, 'categoryFilterLoading');

export const categoryFilterErrorAtom = atom((ctx) => {
  const state = ctx.spy(categoryFilterAtom);
  return state.error;
}, 'categoryFilterError');

export const hasMoreProductsAtom = atom((ctx) => {
  const state = ctx.spy(categoryFilterAtom);
  return state.hasMore;
}, 'hasMoreProducts');

export const canLoadMoreAtom = atom((ctx) => {
  const state = ctx.spy(categoryFilterAtom);
  return state.hasMore && !state.isLoading && state.filteredProducts.length > 0;
}, 'canLoadMore');

export const categoryFilterStatsAtom = atom((ctx) => {
  const state = ctx.spy(categoryFilterAtom);
  return {
    totalCount: state.totalCount,
    loadedCount: state.filteredProducts.length,
    hasResults: state.filteredProducts.length > 0,
    isEmpty: !state.isLoading && state.filteredProducts.length === 0,
    hasMore: state.hasMore
  };
}, 'categoryFilterStats');

export const categoryFilterHistorySelector = atom((ctx) => {
  return ctx.spy(categoryFilterHistoryAtom);
}, 'categoryFilterHistorySelector');

export const isAllCategoriesSelectedAtom = atom((ctx) => {
  const selectedId = ctx.spy(selectedCategoryIdAtom);
  return selectedId === ALL_CATEGORIES_ID;
}, 'isAllCategoriesSelected');

// Утилитарные функции
export const isCategorySelected = (ctx: Ctx, categoryId: number): boolean => {
  const selectedId = ctx.get(selectedCategoryIdAtom);
  return selectedId === categoryId;
};

export const getFilteredProductsCount = (ctx: Ctx): number => {
  const state = ctx.get(categoryFilterAtom);
  return state.filteredProducts.length;
};

export const getCategoryFilterState = (ctx: Ctx) => {
  return ctx.get(categoryFilterAtom);
};

// Валидация категории
export const validateCategoryFilter = (categoryId: number): { 
  isValid: boolean; 
  error?: string; 
} => {
  if (!Number.isInteger(categoryId) || categoryId < 0) {
    return { isValid: false, error: 'Некорректный ID категории' };
  }
  
  return { isValid: true };
};

// Хелпер для построения текста фильтрации
export const getCategoryFilterText = (categoryId: number, categories: Category[]): string => {
  if (categoryId === ALL_CATEGORIES_ID) {
    return 'Все товары';
  }
  
  const category = categories.find(cat => cat.id === categoryId);
  return category ? `Категория: ${category.title}` : 'Неизвестная категория';
};

// Хелпер для получения следующей/предыдущей категории
export const getAdjacentCategory = (
  currentCategoryId: number, 
  categories: Category[], 
  direction: 'next' | 'prev'
): Category | null => {
  const currentIndex = categories.findIndex(cat => cat.id === currentCategoryId);
  
  if (currentIndex === -1) return null;
  
  const nextIndex = direction === 'next' 
    ? (currentIndex + 1) % categories.length
    : (currentIndex - 1 + categories.length) % categories.length;
    
  return categories[nextIndex] || null;
};

// Сброс состояния при размонтировании
export const cleanupCategoryFilterAction = action((ctx: Ctx) => {
  resetCategoryFilterAction(ctx);
}, 'cleanupCategoryFilter');