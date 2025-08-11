import { atom, action, Ctx } from '@reatom/core';
import { addToCartAction } from '@/entities/cart';
import { 
  getSelectedSize,
  getProductQuantity,
  canAddToCart
} from '@/entities/product';
import type { Product } from '@/entities/product';

// Состояние процесса добавления в корзину
interface AddToCartState {
  isAdding: boolean;
  error: string | null;
  lastAddedProductId: number | null;
}

// Атом состояния добавления в корзину
export const addToCartStateAtom = atom<AddToCartState>({
  isAdding: false,
  error: null,
  lastAddedProductId: null
}, 'addToCartState');

// Action для начала процесса добавления
export const startAddToCartAction = action((ctx: Ctx) => {
  const current = ctx.get(addToCartStateAtom);
  addToCartStateAtom(ctx, { 
    ...current, 
    isAdding: true, 
    error: null 
  });
}, 'startAddToCart');

// Action для успешного добавления
export const addToCartSuccessAction = action((ctx: Ctx, productId: number) => {
  addToCartStateAtom(ctx, {
    isAdding: false,
    error: null,
    lastAddedProductId: productId
  });
}, 'addToCartSuccess');

// Action для ошибки добавления
export const addToCartErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(addToCartStateAtom);
  addToCartStateAtom(ctx, {
    ...current,
    isAdding: false,
    error
  });
}, 'addToCartError');

// Основной action для добавления товара в корзину
export const handleAddToCartAction = action(async (ctx: Ctx, product: Product) => {
  try {
    // Начинаем процесс
    startAddToCartAction(ctx);
    
    // Получаем выбранный размер и количество
    const selectedSize = getSelectedSize(ctx, product.id);
    const quantity = getProductQuantity(ctx, product.id);
    
    // Валидация
    if (!selectedSize) {
      throw new Error('Выберите размер товара');
    }
    
    if (!canAddToCart(ctx, product.id, product)) {
      throw new Error('Товар недоступен для добавления в корзину');
    }
    
    // Добавляем в корзину
    await addToCartAction(ctx, {
      productId: product.id,
      title: product.title,
      size: selectedSize,
      price: product.price,
      count: quantity,
      image: product.images[0]
    });
    
    // Успешное добавление
    addToCartSuccessAction(ctx, product.id);
    
    return { success: true, productId: product.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка добавления товара';
    addToCartErrorAction(ctx, errorMessage);
    
    return { success: false, error: errorMessage };
  }
}, 'handleAddToCart');

// Селекторы
export const addToCartSelector = atom((ctx) => {
  return ctx.spy(addToCartStateAtom);
}, 'addToCartSelector');

export const isAddingToCartAtom = atom((ctx) => {
  const state = ctx.spy(addToCartStateAtom);
  return state.isAdding;
}, 'isAddingToCart');

export const addToCartErrorAtom = atom((ctx) => {
  const state = ctx.spy(addToCartStateAtom);
  return state.error;
}, 'addToCartErrorSelector');

// Утилиты для работы с формой добавления в корзину
export const validateAddToCartForm = (ctx: Ctx, productId: number, product?: Product): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!product) {
    errors.push('Товар не найден');
    return { isValid: false, errors };
  }
  
  const selectedSize = getSelectedSize(ctx, productId);
  const quantity = getProductQuantity(ctx, productId);
  
  if (!selectedSize) {
    errors.push('Выберите размер');
  }
  
  if (quantity < 1 || quantity > 10) {
    errors.push('Количество должно быть от 1 до 10');
  }
  
  const hasAvailableSizes = product.sizes.some(size => size.available);
  if (!hasAvailableSizes) {
    errors.push('Товар недоступен');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Сброс состояния после добавления
export const resetAddToCartStateAction = action((ctx: Ctx) => {
  addToCartStateAtom(ctx, {
    isAdding: false,
    error: null,
    lastAddedProductId: null
  });
}, 'resetAddToCartState');