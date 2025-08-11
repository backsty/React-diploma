import { atom, action, Ctx } from '@reatom/core';
import { getItems } from '../api/get-items';
import type { ProductPreview } from '@/entities/product';

export interface CatalogState {
  items: ProductPreview[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;
  searchQuery: string;
  categoryId: number | null;
}

const initialState: CatalogState = {
  items: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
  offset: 0,
  searchQuery: '',
  categoryId: null
};

export const catalogStateAtom = atom<CatalogState>(initialState, 'catalogState');

// Action для установки поискового запроса
export const setSearchQueryAction = action((ctx: Ctx, query: string) => {
  const current = ctx.get(catalogStateAtom);
  catalogStateAtom(ctx, {
    ...current,
    searchQuery: query.trim()
  });
}, 'setSearchQuery');

// Action для начала загрузки каталога
export const startLoadCatalogAction = action((ctx: Ctx) => {
  const current = ctx.get(catalogStateAtom);
  catalogStateAtom(ctx, {
    ...current,
    loading: true,
    error: null
  });
}, 'startLoadCatalog');

// Action для успешной загрузки каталога
export const loadCatalogSuccessAction = action((ctx: Ctx, data: { items: ProductPreview[]; hasMore: boolean; reset?: boolean }) => {
  const current = ctx.get(catalogStateAtom);
  catalogStateAtom(ctx, {
    ...current,
    items: data.reset ? data.items : [...current.items, ...data.items],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: data.hasMore,
    offset: data.reset ? data.items.length : current.offset + data.items.length
  });
}, 'loadCatalogSuccess');

// Action для ошибки загрузки каталога
export const loadCatalogErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(catalogStateAtom);
  catalogStateAtom(ctx, {
    ...current,
    loading: false,
    loadingMore: false,
    error
  });
}, 'loadCatalogError');

// Основной action для загрузки каталога
export const loadCatalogAction = action(async (ctx: Ctx, params: {
  categoryId?: number | null;
  searchQuery?: string;
  reset?: boolean;
} = {}) => {
  try {
    const current = ctx.get(catalogStateAtom);
    const { categoryId = current.categoryId, searchQuery = current.searchQuery, reset = false } = params;
    
    // Обновляем параметры поиска
    if (reset || categoryId !== current.categoryId || searchQuery !== current.searchQuery) {
      catalogStateAtom(ctx, {
        ...current,
        categoryId,
        searchQuery: searchQuery?.trim() || '',
        offset: 0,
        items: reset ? [] : current.items
      });
    }
    
    startLoadCatalogAction(ctx);
    
    const updatedState = ctx.get(catalogStateAtom);
    const offset = reset ? 0 : updatedState.offset;
    
    // ✅ ИСПРАВЛЕНО: Используем console.warn для отладки
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔍 Загрузка каталога с параметрами:', {
        categoryId: updatedState.categoryId,
        searchQuery: updatedState.searchQuery,
        offset
      });
    }
    
    const response = await getItems({
      categoryId: updatedState.categoryId,
      q: updatedState.searchQuery,
      offset
    });
    
    // ✅ ИСПРАВЛЕНО: Используем console.warn для отладки
    if (process.env.NODE_ENV === 'development') {
      console.warn('✅ Получен ответ:', response);
    }
    
    loadCatalogSuccessAction(ctx, {
      items: response,
      hasMore: response.length >= 6, // Предполагаем, что 6 - размер страницы
      reset
    });
    
    return { success: true, items: response };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки каталога';
    console.error('❌ Ошибка загрузки каталога:', error);
    loadCatalogErrorAction(ctx, errorMessage);
    return { success: false, error: errorMessage };
  }
}, 'loadCatalog');

// Action для загрузки дополнительных товаров
export const loadMoreCatalogAction = action(async (ctx: Ctx, params: {
  categoryId?: number | null;
  searchQuery?: string;
} = {}) => {
  try {
    const current = ctx.get(catalogStateAtom);
    
    if (current.loading || current.loadingMore || !current.hasMore) {
      return { success: false, error: 'Загрузка уже выполняется или нет больше товаров' };
    }
    
    catalogStateAtom(ctx, {
      ...current,
      loadingMore: true,
      error: null
    });
    
    const response = await getItems({
      categoryId: params.categoryId ?? current.categoryId,
      q: params.searchQuery ?? current.searchQuery,
      offset: current.offset
    });
    
    loadCatalogSuccessAction(ctx, {
      items: response,
      hasMore: response.length >= 6,
      reset: false
    });
    
    return { success: true, items: response };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки дополнительных товаров';
    loadCatalogErrorAction(ctx, errorMessage);
    return { success: false, error: errorMessage };
  }
}, 'loadMoreCatalog');

// Action для сброса состояния каталога
export const resetCatalogAction = action((ctx: Ctx) => {
  catalogStateAtom(ctx, initialState);
}, 'resetCatalog');

// Селекторы
export const catalogSelector = atom((ctx) => {
  return ctx.spy(catalogStateAtom);
}, 'catalogSelector');

export const catalogItemsAtom = atom((ctx) => {
  const state = ctx.spy(catalogStateAtom);
  return state.items;
}, 'catalogItems');

export const catalogLoadingAtom = atom((ctx) => {
  const state = ctx.spy(catalogStateAtom);
  return state.loading;
}, 'catalogLoading');

export const catalogLoadingMoreAtom = atom((ctx) => {
  const state = ctx.spy(catalogStateAtom);
  return state.loadingMore;
}, 'catalogLoadingMore');

export const catalogErrorAtom = atom((ctx) => {
  const state = ctx.spy(catalogStateAtom);
  return state.error;
}, 'catalogError');

export const catalogHasMoreAtom = atom((ctx) => {
  const state = ctx.spy(catalogStateAtom);
  return state.hasMore;
}, 'catalogHasMore');

export const catalogSearchQueryAtom = atom((ctx) => {
  const state = ctx.spy(catalogStateAtom);
  return state.searchQuery;
}, 'catalogSearchQuery');

// Утилитарные функции
export const canLoadMore = (ctx: Ctx): boolean => {
  const state = ctx.get(catalogStateAtom);
  return !state.loading && !state.loadingMore && state.hasMore;
};

export const isEmptyState = (ctx: Ctx): boolean => {
  const state = ctx.get(catalogStateAtom);
  return state.items.length === 0 && !state.loading && !state.error;
};

export const hasItems = (ctx: Ctx): boolean => {
  const state = ctx.get(catalogStateAtom);
  return state.items.length > 0;
};