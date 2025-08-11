import { atom, action, Ctx } from '@reatom/core';
import { getCategoriesWithAll } from '../api/get-categories';
import type { Category } from '@/shared/lib/api';

// Состояние категорий
interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: number | null; // null означает "Все", или 0
}

// Атом состояния категорий
export const categoriesStateAtom = atom<CategoriesState>({
  items: [],
  loading: false,
  error: null,
  selectedCategoryId: null // По умолчанию выбрана категория "Все"
}, 'categoriesState');

// Action для начала загрузки категорий
export const startLoadCategoriesAction = action((ctx: Ctx) => {
  const current = ctx.get(categoriesStateAtom);
  categoriesStateAtom(ctx, {
    ...current,
    loading: true,
    error: null
  });
}, 'startLoadCategories');

// Action для успешной загрузки категорий
export const loadCategoriesSuccessAction = action((ctx: Ctx, categories: Category[]) => {
  categoriesStateAtom(ctx, {
    items: categories,
    loading: false,
    error: null,
    selectedCategoryId: null // По умолчанию "Все"
  });
}, 'loadCategoriesSuccess');

// Action для ошибки загрузки категорий
export const loadCategoriesErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(categoriesStateAtom);
  categoriesStateAtom(ctx, {
    ...current,
    loading: false,
    error
  });
}, 'loadCategoriesError');

// Action для выбора категории
export const selectCategoryAction = action((ctx: Ctx, categoryId: number | null) => {
  const current = ctx.get(categoriesStateAtom);
  categoriesStateAtom(ctx, {
    ...current,
    selectedCategoryId: categoryId
  });
}, 'selectCategory');

// Основной action для загрузки категорий
export const loadCategoriesAction = action(async (ctx: Ctx) => {
  try {
    startLoadCategoriesAction(ctx);
    const categories = await getCategoriesWithAll();
    loadCategoriesSuccessAction(ctx, categories);
    return { success: true, categories };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки категорий';
    loadCategoriesErrorAction(ctx, errorMessage);
    return { success: false, error: errorMessage };
  }
}, 'loadCategories');

// Селекторы
export const categoriesSelector = atom((ctx) => {
  return ctx.spy(categoriesStateAtom);
}, 'categoriesSelector');

export const categoriesItemsAtom = atom((ctx) => {
  const state = ctx.spy(categoriesStateAtom);
  return state.items;
}, 'categoriesItems');

export const categoriesLoadingAtom = atom((ctx) => {
  const state = ctx.spy(categoriesStateAtom);
  return state.loading;
}, 'categoriesLoading');

export const categoriesErrorAtom = atom((ctx) => {
  const state = ctx.spy(categoriesStateAtom);
  return state.error;
}, 'categoriesError');

export const selectedCategoryIdAtom = atom((ctx) => {
  const state = ctx.spy(categoriesStateAtom);
  return state.selectedCategoryId;
}, 'selectedCategoryId');

// Утилитарные функции
export const getSelectedCategory = (ctx: Ctx): Category | null => {
  const state = ctx.get(categoriesStateAtom);
  if (state.selectedCategoryId === null || state.selectedCategoryId === 0) {
    return state.items.find(cat => cat.id === 0) || null; // Категория "Все"
  }
  return state.items.find(cat => cat.id === state.selectedCategoryId) || null;
};

export const isCategorySelected = (ctx: Ctx, categoryId: number | null): boolean => {
  const state = ctx.get(categoriesStateAtom);
  return state.selectedCategoryId === categoryId;
};