import { atom, action, Ctx } from '@reatom/core';
import { API_CONFIG } from '@/shared/config';
import { apiClient } from '@/shared/lib';
import type { Product } from '@/entities/product';

// Состояние поиска товаров
export interface SearchState {
  query: string;
  isSearching: boolean;
  results: Product[];
  error: string | null;
  hasSearched: boolean;
  totalFound: number;
  suggestions: string[];
}

// Состояние фильтров поиска
export interface SearchFilters {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

// Состояние истории поиска
export interface SearchHistory {
  queries: string[];
  lastSearched: string | null;
}

// Атом состояния поиска
export const searchStateAtom = atom<SearchState>({
  query: '',
  isSearching: false,
  results: [],
  error: null,
  hasSearched: false,
  totalFound: 0,
  suggestions: []
}, 'searchState');

// Атом фильтров поиска
export const searchFiltersAtom = atom<SearchFilters>({}, 'searchFilters');

// Атом истории поиска
export const searchHistoryAtom = atom<SearchHistory>({
  queries: [],
  lastSearched: null
}, 'searchHistory');

// Action для обновления поискового запроса
export const setSearchQueryAction = action((ctx: Ctx, query: string) => {
  const current = ctx.get(searchStateAtom);
  searchStateAtom(ctx, { 
    ...current, 
    query: query.trim(),
    error: null 
  });
}, 'setSearchQuery');

// Action для начала поиска
export const startSearchAction = action((ctx: Ctx) => {
  const current = ctx.get(searchStateAtom);
  searchStateAtom(ctx, { 
    ...current, 
    isSearching: true, 
    error: null 
  });
}, 'startSearch');

// Action для успешного поиска
export const searchSuccessAction = action((ctx: Ctx, results: Product[], totalFound: number) => {
  const current = ctx.get(searchStateAtom);
  const newState: SearchState = {
    ...current,
    isSearching: false,
    results,
    error: null,
    hasSearched: true,
    totalFound
  };
  searchStateAtom(ctx, newState);
  
  // Добавляем в историю если есть результаты
  if (current.query && results.length > 0) {
    addToSearchHistoryAction(ctx, current.query);
  }
}, 'searchSuccess');

// Action для ошибки поиска
export const searchErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(searchStateAtom);
  searchStateAtom(ctx, {
    ...current,
    isSearching: false,
    error,
    hasSearched: true,
    results: [],
    totalFound: 0
  });
}, 'searchError');

// Основной action для выполнения поиска
export const performSearchAction = action(async (ctx: Ctx, query?: string) => {
  try {
    const currentState = ctx.get(searchStateAtom);
    const searchQuery = query || currentState.query;
    
    // Валидация запроса
    if (!searchQuery || searchQuery.length < API_CONFIG.SEARCH_MIN_LENGTH) {
      searchErrorAction(ctx, `Минимальная длина запроса: ${API_CONFIG.SEARCH_MIN_LENGTH} символов`);
      return { success: false, error: 'Слишком короткий запрос' };
    }
    
    // Обновляем запрос если передан новый
    if (query && query !== currentState.query) {
      setSearchQueryAction(ctx, query);
    }
    
    // Начинаем поиск
    startSearchAction(ctx);
    
    // Получаем фильтры
    const filters = ctx.get(searchFiltersAtom);
    
    // Формируем параметры запроса
    const searchParams: Record<string, string | number | undefined> = {
      q: searchQuery,
      categoryId: filters.categoryId,
      offset: 0 // Всегда начинаем с начала при новом поиске
    };
    
    // Выполняем поиск через API
    const results = await apiClient.getWithParams<Product[]>('/api/items', searchParams);
    
    // Фильтруем результаты по дополнительным критериям (если нужно)
    let filteredResults = results;
    
    if (filters.minPrice !== undefined) {
      filteredResults = filteredResults.filter(item => item.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      filteredResults = filteredResults.filter(item => item.price <= filters.maxPrice!);
    }
    
    if (filters.inStock) {
      filteredResults = filteredResults.filter(item => 
        item.sizes.some(size => size.available)
      );
    }
    
    // Успешный поиск
    searchSuccessAction(ctx, filteredResults, filteredResults.length);
    
    return { 
      success: true, 
      results: filteredResults, 
      totalFound: filteredResults.length 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка поиска';
    searchErrorAction(ctx, errorMessage);
    
    return { success: false, error: errorMessage };
  }
}, 'performSearch');

// Action для очистки результатов поиска
export const clearSearchAction = action((ctx: Ctx) => {
  searchStateAtom(ctx, {
    query: '',
    isSearching: false,
    results: [],
    error: null,
    hasSearched: false,
    totalFound: 0,
    suggestions: []
  });
}, 'clearSearch');

// Action для обновления фильтров
export const setSearchFiltersAction = action((ctx: Ctx, filters: Partial<SearchFilters>) => {
  const current = ctx.get(searchFiltersAtom);
  searchFiltersAtom(ctx, { ...current, ...filters });
}, 'setSearchFilters');

// Action для очистки фильтров
export const clearSearchFiltersAction = action((ctx: Ctx) => {
  searchFiltersAtom(ctx, {});
}, 'clearSearchFilters');

// Action для добавления в историю поиска
export const addToSearchHistoryAction = action((ctx: Ctx, query: string) => {
  const current = ctx.get(searchHistoryAtom);
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) return;
  
  // Убираем дубликаты и добавляем в начало
  const newQueries = [
    trimmedQuery,
    ...current.queries.filter(q => q !== trimmedQuery)
  ].slice(0, 10); // Сохраняем только последние 10 запросов
  
  searchHistoryAtom(ctx, {
    queries: newQueries,
    lastSearched: trimmedQuery
  });
}, 'addToSearchHistory');

// Action для очистки истории поиска
export const clearSearchHistoryAction = action((ctx: Ctx) => {
  searchHistoryAtom(ctx, {
    queries: [],
    lastSearched: null
  });
}, 'clearSearchHistory');

// Action для поиска по запросу из истории
export const searchFromHistoryAction = action(async (ctx: Ctx, query: string) => {
  setSearchQueryAction(ctx, query);
  return await performSearchAction(ctx, query);
}, 'searchFromHistory');

// Селекторы
export const searchSelector = atom((ctx) => {
  return ctx.spy(searchStateAtom);
}, 'searchSelector');

export const searchQueryAtom = atom((ctx) => {
  const state = ctx.spy(searchStateAtom);
  return state.query;
}, 'searchQuery');

export const searchResultsAtom = atom((ctx) => {
  const state = ctx.spy(searchStateAtom);
  return state.results;
}, 'searchResults');

export const isSearchingAtom = atom((ctx) => {
  const state = ctx.spy(searchStateAtom);
  return state.isSearching;
}, 'isSearching');

export const searchErrorAtom = atom((ctx) => {
  const state = ctx.spy(searchStateAtom);
  return state.error;
}, 'searchErrorSelector');

export const hasSearchResultsAtom = atom((ctx) => {
  const state = ctx.spy(searchStateAtom);
  return state.hasSearched && state.results.length > 0;
}, 'hasSearchResults');

export const searchFiltersSelector = atom((ctx) => {
  return ctx.spy(searchFiltersAtom);
}, 'searchFiltersSelector');

export const searchHistorySelector = atom((ctx) => {
  return ctx.spy(searchHistoryAtom);
}, 'searchHistorySelector');

export const canSearchAtom = atom((ctx) => {
  const state = ctx.spy(searchStateAtom);
  return state.query.length >= API_CONFIG.SEARCH_MIN_LENGTH && !state.isSearching;
}, 'canSearch');

export const searchStatsAtom = atom((ctx) => {
  const state = ctx.spy(searchStateAtom);
  return {
    totalFound: state.totalFound,
    hasResults: state.results.length > 0,
    hasSearched: state.hasSearched,
    isEmpty: state.hasSearched && state.results.length === 0
  };
}, 'searchStats');

// Утилитарные функции
export const validateSearchQuery = (query: string): { isValid: boolean; error?: string } => {
  const trimmed = query.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Введите поисковый запрос' };
  }
  
  if (trimmed.length < API_CONFIG.SEARCH_MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `Минимальная длина запроса: ${API_CONFIG.SEARCH_MIN_LENGTH} символов` 
    };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Слишком длинный запрос' };
  }
  
  return { isValid: true };
};

export const formatSearchResults = (results: Product[], query: string) => {
  return results.map(product => ({
    ...product,
    // Подсвечиваем совпадения в названии (для UI)
    highlightedTitle: highlightMatches(product.title, query)
  }));
};

// Хелпер для подсветки совпадений
const highlightMatches = (text: string, query: string): string => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Сброс состояния поиска
export const resetSearchStateAction = action((ctx: Ctx) => {
  searchStateAtom(ctx, {
    query: '',
    isSearching: false,
    results: [],
    error: null,
    hasSearched: false,
    totalFound: 0,
    suggestions: []
  });
  searchFiltersAtom(ctx, {});
}, 'resetSearchState');