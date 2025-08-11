import { atom, action, Ctx } from '@reatom/core';
import { 
  cartAtom, 
  updateCartItemAction, 
  removeFromCartAction
} from '@/shared/store';
// import { showNotification } from '@/shared/lib';

// Состояние обновления количества товара
export interface UpdateQuantityState {
  isUpdating: boolean;
  updatingItemId: string | null;
  error: string | null;
  pendingOperations: Map<string, 'increase' | 'decrease' | 'set'>;
  lastOperation?: {
    itemId: string;
    operation: 'increase' | 'decrease' | 'set';
    previousQuantity: number;
    newQuantity: number;
    timestamp: number;
  } | undefined;
}

// Настройки обновления количества
export interface UpdateQuantitySettings {
  enableOptimisticUpdates: boolean;
  showNotifications: boolean;
  maxQuantity: number;
  minQuantity: number;
  debounceMs: number;
  enableUndo: boolean;
  undoTimeoutMs: number;
}

// Атом состояния обновления количества
export const updateQuantityStateAtom = atom<UpdateQuantityState>({
  isUpdating: false,
  updatingItemId: null,
  error: null,
  pendingOperations: new Map(),
  lastOperation: undefined // Явно указываем undefined
}, 'updateQuantityState');

// Атом настроек обновления количества
export const updateQuantitySettingsAtom = atom<UpdateQuantitySettings>({
  enableOptimisticUpdates: true,
  showNotifications: true,
  maxQuantity: 10,
  minQuantity: 1,
  debounceMs: 300,
  enableUndo: true,
  undoTimeoutMs: 5000
}, 'updateQuantitySettings');

// Action для начала обновления количества
export const startUpdateQuantityAction = action((ctx: Ctx, itemId: string) => {
  const current = ctx.get(updateQuantityStateAtom);
  updateQuantityStateAtom(ctx, {
    ...current,
    isUpdating: true,
    updatingItemId: itemId,
    error: null
  });
}, 'startUpdateQuantity');

// Action для завершения обновления количества
export const finishUpdateQuantityAction = action((ctx: Ctx) => {
  const current = ctx.get(updateQuantityStateAtom);
  updateQuantityStateAtom(ctx, {
    ...current,
    isUpdating: false,
    updatingItemId: null
  });
}, 'finishUpdateQuantity');

// Action для ошибки обновления количества
export const updateQuantityErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(updateQuantityStateAtom);
  updateQuantityStateAtom(ctx, {
    ...current,
    isUpdating: false,
    updatingItemId: null,
    error
  });
}, 'updateQuantityError');

// Action для добавления операции в очередь
export const addPendingOperationAction = action((
  ctx: Ctx, 
  itemId: string, 
  operation: 'increase' | 'decrease' | 'set'
) => {
  const current = ctx.get(updateQuantityStateAtom);
  const newPendingOperations = new Map(current.pendingOperations);
  newPendingOperations.set(itemId, operation);
  
  updateQuantityStateAtom(ctx, {
    ...current,
    pendingOperations: newPendingOperations
  });
}, 'addPendingOperation');

// Action для удаления операции из очереди
export const removePendingOperationAction = action((ctx: Ctx, itemId: string) => {
  const current = ctx.get(updateQuantityStateAtom);
  const newPendingOperations = new Map(current.pendingOperations);
  newPendingOperations.delete(itemId);
  
  updateQuantityStateAtom(ctx, {
    ...current,
    pendingOperations: newPendingOperations
  });
}, 'removePendingOperation');

// Action для записи последней операции
export const recordLastOperationAction = action((
  ctx: Ctx,
  itemId: string,
  operation: 'increase' | 'decrease' | 'set',
  previousQuantity: number,
  newQuantity: number
) => {
  const current = ctx.get(updateQuantityStateAtom);
  updateQuantityStateAtom(ctx, {
    ...current,
    lastOperation: {
      itemId,
      operation,
      previousQuantity,
      newQuantity,
      timestamp: Date.now()
    }
  });
}, 'recordLastOperation');

// Основной action для увеличения количества
export const increaseQuantityAction = action(async (
  ctx: Ctx, 
  itemId: string
) => {
  try {
    const cart = ctx.get(cartAtom);
    const settings = ctx.get(updateQuantitySettingsAtom);
    
    const item = cart.items.find(item => item.id === parseInt(itemId, 10));
    if (!item) {
      updateQuantityErrorAction(ctx, 'Товар не найден в корзине');
      return { success: false, error: 'Товар не найден' };
    }
    
    // Проверяем максимальное количество
    if (item.count >= settings.maxQuantity) {
      const message = `Максимальное количество: ${settings.maxQuantity}`;
      updateQuantityErrorAction(ctx, message);
      
      // Убираем showNotification
      // if (settings.showNotifications) {
      //   showNotification(message, 'warning');
      // }
      
      return { success: false, error: message };
    }
    
    const newQuantity = item.count + 1;
    
    // Запоминаем операцию
    recordLastOperationAction(ctx, itemId, 'increase', item.count, newQuantity);
    
    // Добавляем в очередь
    addPendingOperationAction(ctx, itemId, 'increase');
    
    // Начинаем обновление
    startUpdateQuantityAction(ctx, itemId);
    
    // Обновляем количество
    updateCartItemAction(ctx, item.id, item.size, newQuantity);
    
    // Убираем из очереди
    removePendingOperationAction(ctx, itemId);
    
    // Завершаем обновление
    finishUpdateQuantityAction(ctx);
    
    // if (settings.showNotifications) {
    //   showNotification('Количество увеличено', 'success');
    // }
    
    return { 
      success: true, 
      newQuantity,
      previousQuantity: item.count 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка увеличения количества';
    updateQuantityErrorAction(ctx, errorMessage);
    removePendingOperationAction(ctx, itemId);
    
    return { success: false, error: errorMessage };
  }
}, 'increaseQuantity');

// Action для уменьшения количества
export const decreaseQuantityAction = action(async (
  ctx: Ctx, 
  itemId: string
) => {
  try {
    const cart = ctx.get(cartAtom);
    const settings = ctx.get(updateQuantitySettingsAtom);
    
    const item = cart.items.find(item => item.id === parseInt(itemId, 10));
    if (!item) {
      updateQuantityErrorAction(ctx, 'Товар не найден в корзине');
      return { success: false, error: 'Товар не найден' };
    }
    
    // Если количество станет меньше минимального - удаляем товар
    if (item.count <= settings.minQuantity) {
      // Запоминаем операцию удаления
      recordLastOperationAction(ctx, itemId, 'decrease', item.count, 0);
      
      // Добавляем в очередь
      addPendingOperationAction(ctx, itemId, 'decrease');
      
      // Начинаем обновление
      startUpdateQuantityAction(ctx, itemId);
      
      // Удаляем товар
      removeFromCartAction(ctx, item.id, item.size);
      
      // Убираем из очереди
      removePendingOperationAction(ctx, itemId);
      
      // Завершаем обновление
      finishUpdateQuantityAction(ctx);

      // if (settings.showNotifications) {
      //   showNotification('Товар удален из корзины', 'info');
      // }
      
      return { 
        success: true, 
        newQuantity: 0,
        previousQuantity: item.count,
        removed: true
      };
    }
    
    const newQuantity = item.count - 1;
    
    // Запоминаем операцию
    recordLastOperationAction(ctx, itemId, 'decrease', item.count, newQuantity);
    
    // Добавляем в очередь
    addPendingOperationAction(ctx, itemId, 'decrease');
    
    // Начинаем обновление
    startUpdateQuantityAction(ctx, itemId);
    
    // Обновляем количество
    updateCartItemAction(ctx, item.id, item.size, newQuantity);
    
    // Убираем из очереди
    removePendingOperationAction(ctx, itemId);
    
    // Завершаем обновление
    finishUpdateQuantityAction(ctx);
    
    // if (settings.showNotifications) {
    //   showNotification('Количество уменьшено', 'success');
    // }
    
    return { 
      success: true, 
      newQuantity,
      previousQuantity: item.count 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка уменьшения количества';
    updateQuantityErrorAction(ctx, errorMessage);
    removePendingOperationAction(ctx, itemId);
    
    return { success: false, error: errorMessage };
  }
}, 'decreaseQuantity');

// Action для установки конкретного количества
export const setQuantityAction = action(async (
  ctx: Ctx, 
  itemId: string, 
  quantity: number
) => {
  try {
    const cart = ctx.get(cartAtom);
    const settings = ctx.get(updateQuantitySettingsAtom);
    
    const item = cart.items.find(item => item.id === parseInt(itemId, 10));
    if (!item) {
      updateQuantityErrorAction(ctx, 'Товар не найден в корзине');
      return { success: false, error: 'Товар не найден' };
    }
    
    // Валидация количества
    if (quantity < settings.minQuantity) {
      const message = `Минимальное количество: ${settings.minQuantity}`;
      updateQuantityErrorAction(ctx, message);
      return { success: false, error: message };
    }
    
    if (quantity > settings.maxQuantity) {
      const message = `Максимальное количество: ${settings.maxQuantity}`;
      updateQuantityErrorAction(ctx, message);
      return { success: false, error: message };
    }
    
    // Если количество не изменилось
    if (item.count === quantity) {
      return { 
        success: true, 
        newQuantity: quantity,
        previousQuantity: item.count 
      };
    }
    
    // Запоминаем операцию
    recordLastOperationAction(ctx, itemId, 'set', item.count, quantity);
    
    // Добавляем в очередь
    addPendingOperationAction(ctx, itemId, 'set');
    
    // Начинаем обновление
    startUpdateQuantityAction(ctx, itemId);
    
    // Обновляем количество
    updateCartItemAction(ctx, item.id, item.size, quantity);
    
    // Убираем из очереди
    removePendingOperationAction(ctx, itemId);
    
    // Завершаем обновление
    finishUpdateQuantityAction(ctx);
    
    // if (settings.showNotifications) {
    //   showNotification(`Количество изменено на ${quantity}`, 'success');
    // }
    
    return { 
      success: true, 
      newQuantity: quantity,
      previousQuantity: item.count 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Ошибка установки количества';
    updateQuantityErrorAction(ctx, errorMessage);
    removePendingOperationAction(ctx, itemId);
    
    return { success: false, error: errorMessage };
  }
}, 'setQuantity');

// Action для отмены последней операции (Undo)
export const undoLastOperationAction = action(async (ctx: Ctx) => {
  const current = ctx.get(updateQuantityStateAtom);
  const settings = ctx.get(updateQuantitySettingsAtom);
  
  if (!settings.enableUndo || !current.lastOperation) {
    return { success: false, error: 'Нет операции для отмены' };
  }
  
  const { itemId, previousQuantity, timestamp } = current.lastOperation;
  
  // Проверяем timeout
  if (Date.now() - timestamp > settings.undoTimeoutMs) {
    return { success: false, error: 'Время для отмены истекло' };
  }
  
  // Восстанавливаем предыдущее количество
  if (previousQuantity === 0) {
    // Товар был удален, восстанавливаем его в корзине
    const cart = ctx.get(cartAtom);
    const wasInCart = cart.items.some(item => item.id === parseInt(itemId, 10));
    
    if (!wasInCart) {
      // Нужно восстановить товар из истории или API
      // Это сложная логика, пока пропускаем
      return { success: false, error: 'Невозможно восстановить удаленный товар' };
    }
  } else {
    // Восстанавливаем количество
    await setQuantityAction(ctx, itemId, previousQuantity);
  }
  
  // Очищаем последнюю операцию
  updateQuantityStateAtom(ctx, {
    ...current,
    lastOperation: undefined
  });

  // if (settings.showNotifications) {
  //   showNotification('Операция отменена', 'info');
  // }
  
  return { success: true };
}, 'undoLastOperation');

// Action для сброса состояния
export const resetUpdateQuantityStateAction = action((ctx: Ctx) => {
  updateQuantityStateAtom(ctx, {
    isUpdating: false,
    updatingItemId: null,
    error: null,
    pendingOperations: new Map(),
    lastOperation: undefined // Явно указываем undefined
  });
}, 'resetUpdateQuantityState');

// Селекторы
export const updateQuantityStateSelector = atom((ctx) => {
  return ctx.spy(updateQuantityStateAtom);
}, 'updateQuantityStateSelector');

export const isUpdatingQuantityAtom = atom((ctx) => {
  const state = ctx.spy(updateQuantityStateAtom);
  return state.isUpdating;
}, 'isUpdatingQuantity');

export const updatingItemIdAtom = atom((ctx) => {
  const state = ctx.spy(updateQuantityStateAtom);
  return state.updatingItemId;
}, 'updatingItemId');

export const updateQuantityErrorAtom = atom((ctx) => {
  const state = ctx.spy(updateQuantityStateAtom);
  return state.error;
}, 'updateQuantityError');

export const pendingOperationsAtom = atom((ctx) => {
  const state = ctx.spy(updateQuantityStateAtom);
  return state.pendingOperations;
}, 'pendingOperations');

export const lastOperationAtom = atom((ctx) => {
  const state = ctx.spy(updateQuantityStateAtom);
  return state.lastOperation;
}, 'lastOperation');

export const canUndoAtom = atom((ctx) => {
  const state = ctx.spy(updateQuantityStateAtom);
  const settings = ctx.spy(updateQuantitySettingsAtom);
  
  if (!settings.enableUndo || !state.lastOperation) {
    return false;
  }
  
  const timeSinceOperation = Date.now() - state.lastOperation.timestamp;
  return timeSinceOperation <= settings.undoTimeoutMs;
}, 'canUndo');

export const isItemUpdatingAtom = atom((ctx) => (itemId: string) => {
  const state = ctx.spy(updateQuantityStateAtom);
  return state.updatingItemId === itemId;
}, 'isItemUpdating');

export const hasError = atom((ctx) => {
  const state = ctx.spy(updateQuantityStateAtom);
  return state.error !== null;
}, 'hasError');

// Утилитарные функции
export const validateQuantity = (
  quantity: number, 
  settings: UpdateQuantitySettings
): { isValid: boolean; error?: string } => {
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { isValid: false, error: 'Количество должно быть положительным числом' };
  }
  
  if (quantity < settings.minQuantity) {
    return { isValid: false, error: `Минимальное количество: ${settings.minQuantity}` };
  }
  
  if (quantity > settings.maxQuantity) {
    return { isValid: false, error: `Максимальное количество: ${settings.maxQuantity}` };
  }
  
  return { isValid: true };
};

export const canIncreaseQuantity = (ctx: Ctx, itemId: string): boolean => {
  const cart = ctx.get(cartAtom);
  const settings = ctx.get(updateQuantitySettingsAtom);
  
  const item = cart.items.find(item => item.id === parseInt(itemId, 10));
  if (!item) return false;
  
  return item.count < settings.maxQuantity;
};

export const canDecreaseQuantity = (ctx: Ctx, itemId: string): boolean => {
  const cart = ctx.get(cartAtom);
  const settings = ctx.get(updateQuantitySettingsAtom);
  
  const item = cart.items.find(item => item.id === parseInt(itemId, 10));
  if (!item) return false;
  
  return item.count > settings.minQuantity;
};

export const getQuantityLimits = (ctx: Ctx): { min: number; max: number } => {
  const settings = ctx.get(updateQuantitySettingsAtom);
  return {
    min: settings.minQuantity,
    max: settings.maxQuantity
  };
};

export const getItemQuantity = (ctx: Ctx, itemId: string): number => {
  const cart = ctx.get(cartAtom);
  const item = cart.items.find(item => item.id === parseInt(itemId, 10));
  return item?.count || 0;
};

export const isPendingOperation = (ctx: Ctx, itemId: string): boolean => {
  const state = ctx.get(updateQuantityStateAtom);
  return state.pendingOperations.has(itemId);
};

export const getPendingOperation = (ctx: Ctx, itemId: string): 'increase' | 'decrease' | 'set' | null => {
  const state = ctx.get(updateQuantityStateAtom);
  return state.pendingOperations.get(itemId) || null;
};