import { atom, action, Ctx } from '@reatom/core';
import type { Category, CategoriesState } from './types';

// Константа для категории "Все" (согласно ТЗ добавляется программно)
export const ALL_CATEGORIES_ID = 0;
export const ALL_CATEGORIES_TITLE = 'Все';

// Атом для состояния категорий
export const categoriesAtom = atom<CategoriesState>({
  items: [],
  selectedId: ALL_CATEGORIES_ID, // По умолчанию выбрана категория "Все"
  isLoading: false,
  error: null
}, 'categories');

// Actions для управления состоянием категорий
export const setCategoriesLoadingAction = action((ctx: Ctx, isLoading: boolean) => {
  const current = ctx.get(categoriesAtom);
  categoriesAtom(ctx, { ...current, isLoading });
}, 'setCategoriesLoading');

export const setCategoriesDataAction = action((ctx: Ctx, items: Category[]) => {
  const current = ctx.get(categoriesAtom);
  
  const allCategories: Category[] = [
    { id: ALL_CATEGORIES_ID, title: ALL_CATEGORIES_TITLE },
    ...items
  ];
  
  categoriesAtom(ctx, {
    ...current,
    items: allCategories,
    isLoading: false,
    error: null
  });
}, 'setCategoriesData');

export const setCategoriesErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(categoriesAtom);
  categoriesAtom(ctx, { ...current, error, isLoading: false });
}, 'setCategoriesError');

export const setSelectedCategoryAction = action((ctx: Ctx, categoryId: number) => {
  const current = ctx.get(categoriesAtom);
  categoriesAtom(ctx, { ...current, selectedId: categoryId });
}, 'setSelectedCategory');

export const resetCategoriesAction = action((ctx: Ctx) => {
  categoriesAtom(ctx, {
    items: [],
    selectedId: ALL_CATEGORIES_ID,
    isLoading: false,
    error: null
  });
}, 'resetCategories');

// Селекторы с правильной типизацией ctx
export const categoriesListAtom = atom((ctx) => {
  const state = ctx.spy(categoriesAtom);
  return state;
}, 'categoriesList');

export const selectedCategoryIdAtom = atom((ctx) => {
  const state = ctx.spy(categoriesAtom);
  return state.selectedId;
}, 'selectedCategoryId');

export const selectedCategoryDataAtom = atom((ctx) => {
  const state = ctx.spy(categoriesAtom);
  return state.items.find((item: Category) => item.id === state.selectedId) || null;
}, 'selectedCategoryData');

export const isAllCategoriesSelectedAtom = atom((ctx) => {
  const selectedId = ctx.spy(selectedCategoryIdAtom);
  return selectedId === ALL_CATEGORIES_ID;
}, 'isAllCategoriesSelected');

export const availableCategoriesAtom = atom((ctx) => {
  const state = ctx.spy(categoriesAtom);
  return state.items.filter((category: Category) => category.id !== ALL_CATEGORIES_ID);
}, 'availableCategories');

// Утилитарные функции с правильной типизацией
export const getCategoryById = (ctx: Ctx, categoryId: number): Category | null => {
  const state = ctx.get(categoriesAtom);
  return state.items.find((item: Category) => item.id === categoryId) || null;
};

export const isCategorySelected = (ctx: Ctx, categoryId: number): boolean => {
  const state = ctx.get(categoriesAtom);
  return state.selectedId === categoryId;
};

// Дополнительные селекторы
export const getCategoriesCountAtom = atom((ctx) => {
  const state = ctx.spy(categoriesAtom);
  return state.items.length;
}, 'getCategoriesCount');

export const hasErrorAtom = atom((ctx) => {
  const state = ctx.spy(categoriesAtom);
  return Boolean(state.error);
}, 'hasError');

export const isLoadingAtom = atom((ctx) => {
  const state = ctx.spy(categoriesAtom);
  return state.isLoading;
}, 'isLoading');

// Валидация категории
export const validateCategoryId = (categoryId: number): boolean => {
  return Number.isInteger(categoryId) && categoryId >= 0;
};

export const getCategoryTitle = (ctx: Ctx, categoryId: number): string | null => {
  const category = getCategoryById(ctx, categoryId);
  return category ? category.title : null;
};