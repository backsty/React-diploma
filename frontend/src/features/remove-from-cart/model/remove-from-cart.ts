import { atom, action, Ctx } from '@reatom/core';
import { removeFromCartAction, updateCartItemAction } from '@/entities/cart';
import type { CartItem } from '@/entities/cart';

// Состояние процесса удаления из корзины
interface RemoveFromCartState {
  isRemoving: boolean;
  removingItemId: string | null; // ID удаляемого элемента корзины
  error: string | null;
  lastRemovedItem: CartItem | null;
}

// Атом состояния удаления из корзины
export const removeFromCartStateAtom = atom<RemoveFromCartState>({
  isRemoving: false,
  removingItemId: null,
  error: null,
  lastRemovedItem: null
}, 'removeFromCartState');

// Action для начала процесса удаления
export const startRemoveFromCartAction = action((ctx: Ctx, itemId: string) => {
  const current = ctx.get(removeFromCartStateAtom);
  removeFromCartStateAtom(ctx, { 
    ...current, 
    isRemoving: true, 
    removingItemId: itemId,
    error: null 
  });
}, 'startRemoveFromCart');

// Action для успешного удаления
export const removeFromCartSuccessAction = action((ctx: Ctx, removedItem: CartItem) => {
  removeFromCartStateAtom(ctx, {
    isRemoving: false,
    removingItemId: null,
    error: null,
    lastRemovedItem: removedItem
  });
}, 'removeFromCartSuccess');

// Action для ошибки удаления
export const removeFromCartErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(removeFromCartStateAtom);
  removeFromCartStateAtom(ctx, {
    ...current,
    isRemoving: false,
    removingItemId: null,
    error
  });
}, 'removeFromCartError');

// Основной action для удаления товара из корзины
export const handleRemoveFromCartAction = action(async (ctx: Ctx, item: CartItem) => {
  try {
    // Начинаем процесс удаления (используем string ID)
    startRemoveFromCartAction(ctx, String(item.id));
    
    // Удаляем из корзины (entities/cart принимает number, string)
    await removeFromCartAction(ctx, item.id, item.size);
    
    // Успешное удаление
    removeFromCartSuccessAction(ctx, item);
    
    return { success: true, removedItem: item };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка удаления товара из корзины';
    removeFromCartErrorAction(ctx, errorMessage);
    
    return { success: false, error: errorMessage };
  }
}, 'handleRemoveFromCart');

// Action для изменения количества товара в корзине
export const handleUpdateCartQuantityAction = action(async (ctx: Ctx, itemId: string, newCount: number) => {
  try {
    // Валидация количества
    if (newCount < 1) {
      throw new Error('Количество должно быть больше 0');
    }
    
    if (newCount > 10) {
      throw new Error('Максимальное количество товара: 10');
    }
    
    // Начинаем процесс обновления
    startRemoveFromCartAction(ctx, itemId);
    
    // Обновляем количество (updateCartItemAction принимает другую сигнатуру)
    await updateCartItemAction(ctx, {
      productId: parseInt(itemId, 10),
      size: '', // Размер нужно передать отдельно, получаем из item
      newCount
    });
    
    // Завершаем процесс
    removeFromCartStateAtom(ctx, {
      isRemoving: false,
      removingItemId: null,
      error: null,
      lastRemovedItem: null
    });
    
    return { success: true, newCount };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка обновления количества';
    removeFromCartErrorAction(ctx, errorMessage);
    
    return { success: false, error: errorMessage };
  }
}, 'handleUpdateCartQuantity');

// Action для полной очистки корзины
export const handleClearCartAction = action(async (ctx: Ctx) => {
  try {
    startRemoveFromCartAction(ctx, 'all');
    
    // Очищаем корзину (импортируем clearCartAction)
    // clearCartAction(ctx);
    
    removeFromCartStateAtom(ctx, {
      isRemoving: false,
      removingItemId: null,
      error: null,
      lastRemovedItem: null
    });
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка очистки корзины';
    removeFromCartErrorAction(ctx, errorMessage);
    
    return { success: false, error: errorMessage };
  }
}, 'handleClearCart');

// Селекторы
export const removeFromCartSelector = atom((ctx) => {
  return ctx.spy(removeFromCartStateAtom);
}, 'removeFromCartSelector');

export const isRemovingFromCartAtom = atom((ctx) => {
  const state = ctx.spy(removeFromCartStateAtom);
  return state.isRemoving;
}, 'isRemovingFromCart');

export const removingItemIdAtom = atom((ctx) => {
  const state = ctx.spy(removeFromCartStateAtom);
  return state.removingItemId;
}, 'removingItemId');

export const removeFromCartErrorAtom = atom((ctx) => {
  const state = ctx.spy(removeFromCartStateAtom);
  return state.error;
}, 'removeFromCartError');

// Проверка, удаляется ли конкретный товар (правильная типизация)
export const isItemBeingRemovedAtom = atom((ctx: Ctx, itemId: string) => {
  const state = ctx.get(removeFromCartStateAtom);
  return state.isRemoving && state.removingItemId === itemId;
}, 'isItemBeingRemoved');

// Сброс состояния
export const resetRemoveFromCartStateAction = action((ctx: Ctx) => {
  removeFromCartStateAtom(ctx, {
    isRemoving: false,
    removingItemId: null,
    error: null,
    lastRemovedItem: null
  });
}, 'resetRemoveFromCartState');

// Утилитарные функции
export const canRemoveItem = (item: CartItem): boolean => {
  return Boolean(item && item.id);
};

export const canUpdateQuantity = (item: CartItem, newCount: number): { 
  canUpdate: boolean; 
  error?: string; 
} => {
  if (!item || !item.id) {
    return { canUpdate: false, error: 'Товар не найден' };
  }
  
  if (newCount < 1) {
    return { canUpdate: false, error: 'Количество должно быть больше 0' };
  }
  
  if (newCount > 10) {
    return { canUpdate: false, error: 'Максимальное количество: 10' };
  }
  
  return { canUpdate: true };
};

// Подтверждение удаления (для модальных окон)
export const confirmRemovalAtom = atom<{
  isOpen: boolean;
  item: CartItem | null;
}>({
  isOpen: false,
  item: null
}, 'confirmRemoval');

export const openRemovalConfirmAction = action((ctx: Ctx, item: CartItem) => {
  confirmRemovalAtom(ctx, {
    isOpen: true,
    item
  });
}, 'openRemovalConfirm');

export const closeRemovalConfirmAction = action((ctx: Ctx) => {
  confirmRemovalAtom(ctx, {
    isOpen: false,
    item: null
  });
}, 'closeRemovalConfirm');