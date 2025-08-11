import { atom, action, Ctx } from '@reatom/core';
import type { 
  Product, 
  ProductPreview,
  ProductState, 
  ProductsState, 
  TopSalesState, 
  ProductsQuery
} from './types';

// Атом для детального просмотра продукта
export const productAtom = atom<ProductState>({
  data: null,
  isLoading: false,
  error: null
}, 'product');

// Атом для списка продуктов (каталог)
export const productsAtom = atom<ProductsState>({
  items: [],
  isLoading: false,
  error: null,
  hasMore: true,
  offset: 0,
  query: {}
}, 'products');

// Атом для топ продаж
export const topSalesAtom = atom<TopSalesState>({
  items: [],
  isLoading: false,
  error: null
}, 'topSales');

// Атом для выбранных размеров
export const selectedSizesAtom = atom<Record<number, string>>({}, 'selectedSizes');

// Атом для количества товаров
export const productQuantitiesAtom = atom<Record<number, number>>({}, 'productQuantities');

// Actions для работы с продуктом
export const setProductLoadingAction = action((ctx: Ctx, isLoading: boolean) => {
  const current = ctx.get(productAtom);
  productAtom(ctx, { ...current, isLoading, error: isLoading ? null : current.error });
}, 'setProductLoading');

export const setProductDataAction = action((ctx: Ctx, data: Product) => {
  productAtom(ctx, { 
    data, 
    isLoading: false, 
    error: null 
  });
}, 'setProductData');

export const setProductErrorAction = action((ctx: Ctx, error: string) => {
  productAtom(ctx, { 
    data: null, 
    isLoading: false, 
    error 
  });
}, 'setProductError');

export const clearProductAction = action((ctx: Ctx) => {
  productAtom(ctx, {
    data: null,
    isLoading: false,
    error: null
  });
}, 'clearProduct');

// Actions для работы со списком продуктов
export const setProductsLoadingAction = action((ctx: Ctx, isLoading: boolean) => {
  const current = ctx.get(productsAtom);
  productsAtom(ctx, { ...current, isLoading });
}, 'setProductsLoading');

export const setProductsDataAction = action((ctx: Ctx, items: ProductPreview[], append = false) => {
  const current = ctx.get(productsAtom);
  const newItems = append ? [...current.items, ...items] : items;
  const hasMore = items.length >= 6;
  
  productsAtom(ctx, {
    ...current,
    items: newItems,
    isLoading: false,
    error: null,
    hasMore,
    offset: append ? current.offset + items.length : items.length
  });
}, 'setProductsData');

export const setProductsErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(productsAtom);
  productsAtom(ctx, { ...current, error, isLoading: false });
}, 'setProductsError');

export const setProductsQueryAction = action((ctx: Ctx, query: ProductsQuery) => {
  const current = ctx.get(productsAtom);
  productsAtom(ctx, { 
    ...current, 
    query,
    items: [],
    offset: 0,
    hasMore: true
  });
}, 'setProductsQuery');

export const clearProductsAction = action((ctx: Ctx) => {
  productsAtom(ctx, {
    items: [],
    isLoading: false,
    error: null,
    hasMore: true,
    offset: 0,
    query: {}
  });
}, 'clearProducts');

// Actions для топ продаж
export const setTopSalesLoadingAction = action((ctx: Ctx, isLoading: boolean) => {
  const current = ctx.get(topSalesAtom);
  topSalesAtom(ctx, { ...current, isLoading });
}, 'setTopSalesLoading');

export const setTopSalesDataAction = action((ctx: Ctx, items: ProductPreview[]) => {
  topSalesAtom(ctx, { 
    items, 
    isLoading: false, 
    error: null 
  });
}, 'setTopSalesData');

export const setTopSalesErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(topSalesAtom);
  topSalesAtom(ctx, { ...current, error, isLoading: false });
}, 'setTopSalesError');

export const clearTopSalesAction = action((ctx: Ctx) => {
  topSalesAtom(ctx, {
    items: [],
    isLoading: false,
    error: null
  });
}, 'clearTopSales');

// Actions для выбора размера и количества
export const setSelectedSizeAction = action((ctx: Ctx, productId: number, size: string) => {
  const current = ctx.get(selectedSizesAtom);
  selectedSizesAtom(ctx, { ...current, [productId]: size });
}, 'setSelectedSize');

export const clearSelectedSizeAction = action((ctx: Ctx, productId: number) => {
  const current = ctx.get(selectedSizesAtom);
  const { [productId]: _, ...rest } = current;
  selectedSizesAtom(ctx, rest);
}, 'clearSelectedSize');

export const setProductQuantityAction = action((ctx: Ctx, productId: number, quantity: number) => {
  const current = ctx.get(productQuantitiesAtom);
  const clampedQuantity = Math.max(1, Math.min(10, quantity));
  productQuantitiesAtom(ctx, { ...current, [productId]: clampedQuantity });
}, 'setProductQuantity');

export const clearProductQuantityAction = action((ctx: Ctx, productId: number) => {
  const current = ctx.get(productQuantitiesAtom);
  const { [productId]: _, ...rest } = current;
  productQuantitiesAtom(ctx, rest);
}, 'clearProductQuantity');

// Селекторы с исправленной типизацией ctx
export const currentProductAtom = atom((ctx) => {
  return ctx.spy(productAtom);
}, 'currentProduct');

export const productsListAtom = atom((ctx) => {
  return ctx.spy(productsAtom);
}, 'productsList');

export const topSalesListAtom = atom((ctx) => {
  return ctx.spy(topSalesAtom);
}, 'topSalesList');

export const hasProductsAtom = atom((ctx) => {
  const products = ctx.spy(productsAtom);
  return products.items.length > 0;
}, 'hasProducts');

export const canLoadMoreAtom = atom((ctx) => {
  const products = ctx.spy(productsAtom);
  return products.hasMore && !products.isLoading;
}, 'canLoadMore');

export const isAnyProductLoadingAtom = atom((ctx) => {
  const product = ctx.spy(productAtom);
  const products = ctx.spy(productsAtom);
  const topSales = ctx.spy(topSalesAtom);
  
  return product.isLoading || products.isLoading || topSales.isLoading;
}, 'isAnyProductLoading');

// Утилитарные функции
export const getSelectedSize = (ctx: Ctx, productId: number): string | null => {
  const sizes = ctx.get(selectedSizesAtom);
  return sizes[productId] || null;
};

export const getProductQuantity = (ctx: Ctx, productId: number): number => {
  const quantities = ctx.get(productQuantitiesAtom);
  return quantities[productId] || 1;
};

export const hasAvailableSizes = (product: Product): boolean => {
  return product.sizes.some(size => size.available);
};

export const canAddToCart = (ctx: Ctx, productId: number, product?: Product): boolean => {
  if (!product) return false;
  
  const selectedSize = getSelectedSize(ctx, productId);
  const hasAvailable = hasAvailableSizes(product);
  
  return Boolean(selectedSize && hasAvailable);
};

export const getAvailableSizes = (product: Product): string[] => {
  return product.sizes
    .filter(size => size.available)
    .map(size => size.size);
};

export const getProductMainImage = (product: Product | ProductPreview): string => {
  return product.images[0] || '/images/placeholder.jpg';
};