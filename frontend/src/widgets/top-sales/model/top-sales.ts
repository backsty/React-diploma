import { atom, action, Ctx } from '@reatom/core';
import { getTopSales } from '../api/get-top-sales';
import type { ProductPreview } from '@/entities/product';

// Состояние хитов продаж
interface TopSalesState {
  items: ProductPreview[];
  loading: boolean;
  error: string | null;
}

// Атом состояния хитов продаж
export const topSalesStateAtom = atom<TopSalesState>({
  items: [],
  loading: false,
  error: null
}, 'topSalesState');

// Action для начала загрузки хитов продаж
export const startLoadTopSalesAction = action((ctx: Ctx) => {
  const current = ctx.get(topSalesStateAtom);
  topSalesStateAtom(ctx, {
    ...current,
    loading: true,
    error: null
  });
}, 'startLoadTopSales');

// Action для успешной загрузки хитов продаж
export const loadTopSalesSuccessAction = action((ctx: Ctx, items: ProductPreview[]) => {
  topSalesStateAtom(ctx, {
    items,
    loading: false,
    error: null
  });
}, 'loadTopSalesSuccess');

// Action для ошибки загрузки хитов продаж
export const loadTopSalesErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(topSalesStateAtom);
  topSalesStateAtom(ctx, {
    ...current,
    loading: false,
    error
  });
}, 'loadTopSalesError');

// Основной action для загрузки хитов продаж
export const loadTopSalesAction = action(async (ctx: Ctx) => {
  try {
    startLoadTopSalesAction(ctx);
    const items = await getTopSales();
    loadTopSalesSuccessAction(ctx, items);
    return { success: true, items };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки хитов продаж';
    loadTopSalesErrorAction(ctx, errorMessage);
    return { success: false, error: errorMessage };
  }
}, 'loadTopSales');

// Action для сброса состояния
export const resetTopSalesAction = action((ctx: Ctx) => {
  topSalesStateAtom(ctx, {
    items: [],
    loading: false,
    error: null
  });
}, 'resetTopSales');

// Селекторы
export const topSalesSelector = atom((ctx) => {
  return ctx.spy(topSalesStateAtom);
}, 'topSalesSelector');

export const topSalesItemsAtom = atom((ctx) => {
  const state = ctx.spy(topSalesStateAtom);
  return state.items;
}, 'topSalesItems');

export const topSalesLoadingAtom = atom((ctx) => {
  const state = ctx.spy(topSalesStateAtom);
  return state.loading;
}, 'topSalesLoading');

export const topSalesErrorAtom = atom((ctx) => {
  const state = ctx.spy(topSalesStateAtom);
  return state.error;
}, 'topSalesError');

export const hasTopSalesAtom = atom((ctx) => {
  const state = ctx.spy(topSalesStateAtom);
  return state.items.length > 0;
}, 'hasTopSales');

// Утилитарные функции
export const canLoadTopSales = (ctx: Ctx): boolean => {
  const state = ctx.get(topSalesStateAtom);
  return !state.loading;
};

export const isEmptyTopSales = (ctx: Ctx): boolean => {
  const state = ctx.get(topSalesStateAtom);
  return state.items.length === 0 && !state.loading && !state.error;
};

export const getTopSalesCount = (ctx: Ctx): number => {
  const state = ctx.get(topSalesStateAtom);
  return state.items.length;
};