import { atom, action, Ctx } from '@reatom/core';
import { 
  orderFormAtom,
  orderFormValidationAtom,
  setOrderLoadingAction,
  setOrderSuccessAction,
  setOrderErrorAction,
  updateOrderFormAction,
  resetOrderFormAction,
  resetOrderStateAction,
  formatPhone,
  isValidPhone,
  isValidAddress
} from '@/entities/order';
import { 
  cartAtom, 
  clearCartAction 
} from '@/shared/store';
import { placeOrder, formatPhoneForApi, validatePlaceOrderData } from '../api/place-order';
import type { PlaceOrderData } from '../api/place-order';

// Состояние процесса оформления заказа
export interface PlaceOrderState {
  isSubmitting: boolean;
  step: 'form' | 'processing' | 'success' | 'error';
  agreement: boolean;
  canSubmit: boolean;
  lastAttemptTime?: number;
  retryCount: number;
}

// Настройки оформления заказа
export interface PlaceOrderSettings {
  enableRetry: boolean;
  maxRetries: number;
  retryDelayMs: number;
  autoRedirectAfterSuccess: boolean;
  redirectDelayMs: number;
}

// Атом состояния оформления заказа
export const placeOrderStateAtom = atom<PlaceOrderState>({
  isSubmitting: false,
  step: 'form',
  agreement: false,
  canSubmit: false,
  retryCount: 0
}, 'placeOrderState');

// Атом настроек оформления заказа
export const placeOrderSettingsAtom = atom<PlaceOrderSettings>({
  enableRetry: true,
  maxRetries: 3,
  retryDelayMs: 1000,
  autoRedirectAfterSuccess: false,
  redirectDelayMs: 3000
}, 'placeOrderSettings');

// Action для обновления согласия с условиями
export const setAgreementAction = action((ctx: Ctx, agreement: boolean) => {
  const current = ctx.get(placeOrderStateAtom);
  placeOrderStateAtom(ctx, { 
    ...current, 
    agreement,
    canSubmit: agreement && ctx.get(orderFormValidationAtom).isValid
  });
}, 'setAgreement');

// Action для обновления шага оформления
export const setPlaceOrderStepAction = action((ctx: Ctx, step: PlaceOrderState['step']) => {
  const current = ctx.get(placeOrderStateAtom);
  placeOrderStateAtom(ctx, { ...current, step });
}, 'setPlaceOrderStep');

// Action для начала оформления заказа
export const startPlaceOrderAction = action((ctx: Ctx) => {
  const current = ctx.get(placeOrderStateAtom);
  placeOrderStateAtom(ctx, { 
    ...current, 
    isSubmitting: true, 
    step: 'processing',
    lastAttemptTime: Date.now()
  });
  setOrderLoadingAction(ctx, true);
}, 'startPlaceOrder');

// Action для успешного оформления заказа
export const placeOrderSuccessAction = action((ctx: Ctx, orderId: string) => {
  const current = ctx.get(placeOrderStateAtom);
  placeOrderStateAtom(ctx, { 
    ...current, 
    isSubmitting: false, 
    step: 'success',
    retryCount: 0
  });
  setOrderSuccessAction(ctx, orderId);
  
  // Очищаем корзину после успешного заказа
  clearCartAction(ctx);
  
  // Сбрасываем форму
  resetOrderFormAction(ctx);
}, 'placeOrderSuccess');

// Action для ошибки оформления заказа
export const placeOrderErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(placeOrderStateAtom);
  placeOrderStateAtom(ctx, { 
    ...current, 
    isSubmitting: false, 
    step: 'error',
    retryCount: current.retryCount + 1
  });
  setOrderErrorAction(ctx, error);
}, 'placeOrderError');

// Основной action для оформления заказа
export const submitOrderAction = action(async (ctx: Ctx) => {
  try {
    // Проверяем готовность формы
    const placeOrderState = ctx.get(placeOrderStateAtom);
    const formValidation = ctx.get(orderFormValidationAtom);
    
    if (!placeOrderState.agreement) {
      placeOrderErrorAction(ctx, 'Необходимо согласиться с условиями обработки персональных данных');
      return { success: false, error: 'Нет согласия' };
    }
    
    if (!formValidation.isValid) {
      placeOrderErrorAction(ctx, 'Заполните все обязательные поля корректно');
      return { success: false, error: 'Форма невалидна' };
    }
    
    // Получаем данные формы и корзины
    const orderForm = ctx.get(orderFormAtom);
    const cart = ctx.get(cartAtom);
    
    if (cart.items.length === 0) {
      placeOrderErrorAction(ctx, 'Корзина пуста');
      return { success: false, error: 'Пустая корзина' };
    }
    
    // Начинаем оформление
    startPlaceOrderAction(ctx);
    
    // Подготавливаем данные для API
    const orderData: PlaceOrderData = {
      phone: formatPhoneForApi(orderForm.phone),
      address: orderForm.address.trim(),
      items: cart.items.map(item => ({
        id: item.id,
        price: item.price,
        count: item.count
      }))
    };
    
    // Дополнительная валидация
    const validation = validatePlaceOrderData(orderData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      placeOrderErrorAction(ctx, firstError || 'Ошибка валидации');
      return { success: false, error: firstError };
    }
    
    // Отправляем заказ
    const result = await placeOrder(orderData);
    
    if (result.success && result.orderId) {
      placeOrderSuccessAction(ctx, result.orderId);
      return { success: true, orderId: result.orderId };
    } else {
      placeOrderErrorAction(ctx, result.error || 'Неизвестная ошибка');
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Произошла неожиданная ошибка';
    placeOrderErrorAction(ctx, errorMessage);
    return { success: false, error: errorMessage };
  }
}, 'submitOrder');

// Action для повтора оформления заказа
export const retryOrderAction = action(async (ctx: Ctx) => {
  const settings = ctx.get(placeOrderSettingsAtom);
  const currentState = ctx.get(placeOrderStateAtom);
  
  if (!settings.enableRetry || currentState.retryCount >= settings.maxRetries) {
    placeOrderErrorAction(ctx, 'Превышено максимальное количество попыток');
    return { success: false, error: 'Превышен лимит попыток' };
  }
  
  // Небольшая задержка перед повтором
  if (settings.retryDelayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, settings.retryDelayMs));
  }
  
  return await submitOrderAction(ctx);
}, 'retryOrder');

// Action для сброса состояния оформления заказа
export const resetPlaceOrderAction = action((ctx: Ctx) => {
  placeOrderStateAtom(ctx, {
    isSubmitting: false,
    step: 'form',
    agreement: false,
    canSubmit: false,
    retryCount: 0
  });
  resetOrderStateAction(ctx);
}, 'resetPlaceOrder');

// Action для обновления поля формы с автовалидацией
export const updateOrderFieldAction = action((ctx: Ctx, field: 'phone' | 'address', value: string) => {
  let processedValue = value;
  
  // Форматируем телефон автоматически
  if (field === 'phone') {
    processedValue = formatPhone(value);
  }
  
  // Обновляем форму
  updateOrderFormAction(ctx, { [field]: processedValue });
  
  // Проверяем готовность к отправке
  const agreement = ctx.get(placeOrderStateAtom).agreement;
  const formValidation = ctx.get(orderFormValidationAtom);
  
  const current = ctx.get(placeOrderStateAtom);
  placeOrderStateAtom(ctx, {
    ...current,
    canSubmit: agreement && formValidation.isValid
  });
}, 'updateOrderField');

// Селекторы
export const placeOrderStateSelector = atom((ctx) => {
  return ctx.spy(placeOrderStateAtom);
}, 'placeOrderStateSelector');

export const canSubmitOrderAtom = atom((ctx) => {
  const placeOrderState = ctx.spy(placeOrderStateAtom);
  return placeOrderState.canSubmit && !placeOrderState.isSubmitting;
}, 'canSubmitOrder');

export const isOrderProcessingAtom = atom((ctx) => {
  const placeOrderState = ctx.spy(placeOrderStateAtom);
  return placeOrderState.isSubmitting || placeOrderState.step === 'processing';
}, 'isOrderProcessing');

export const orderStepAtom = atom((ctx) => {
  const placeOrderState = ctx.spy(placeOrderStateAtom);
  return placeOrderState.step;
}, 'orderStep');

export const canRetryOrderAtom = atom((ctx) => {
  const placeOrderState = ctx.spy(placeOrderStateAtom);
  const settings = ctx.spy(placeOrderSettingsAtom);
  
  return (
    settings.enableRetry &&
    placeOrderState.step === 'error' &&
    placeOrderState.retryCount < settings.maxRetries &&
    !placeOrderState.isSubmitting
  );
}, 'canRetryOrder');

export const orderFormValidationSelector = atom((ctx) => {
  return ctx.spy(orderFormValidationAtom);
}, 'orderFormValidationSelector');

export const orderSummaryAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  const orderForm = ctx.spy(orderFormAtom);
  
  return {
    itemsCount: cart.totalCount,
    totalPrice: cart.totalPrice,
    items: cart.items,
    phone: orderForm.phone,
    address: orderForm.address,
    isEmpty: cart.items.length === 0
  };
}, 'orderSummary');

// Утилитарные функции
export const validateOrderForm = (ctx: Ctx): { isValid: boolean; errors: string[] } => {
  const validation = ctx.get(orderFormValidationAtom);
  const errors: string[] = [];
  
  if (validation.errors.phone) {
    errors.push(validation.errors.phone);
  }
  
  if (validation.errors.address) {
    errors.push(validation.errors.address);
  }
  
  return {
    isValid: validation.isValid,
    errors
  };
};

export const getOrderProgress = (ctx: Ctx): { 
  step: number; 
  totalSteps: number; 
  stepName: string; 
} => {
  const currentStep = ctx.get(orderStepAtom);
  
  const stepMap = {
    'form': { step: 1, name: 'Заполнение данных' },
    'processing': { step: 2, name: 'Обработка заказа' },
    'success': { step: 3, name: 'Заказ оформлен' },
    'error': { step: 1, name: 'Ошибка оформления' }
  };
  
  const current = stepMap[currentStep];
  
  return {
    step: current.step,
    totalSteps: 3,
    stepName: current.name
  };
};

export const isFormFieldValid = (ctx: Ctx, field: 'phone' | 'address'): boolean => {
  const form = ctx.get(orderFormAtom);
  
  if (field === 'phone') {
    return isValidPhone(form.phone);
  }
  
  if (field === 'address') {
    return isValidAddress(form.address);
  }
  
  return false;
};

export const getRetryInfo = (ctx: Ctx): {
  canRetry: boolean;
  attemptsLeft: number;
  maxAttempts: number;
} => {
  const placeOrderState = ctx.get(placeOrderStateAtom);
  const settings = ctx.get(placeOrderSettingsAtom);
  
  return {
    canRetry: settings.enableRetry && placeOrderState.retryCount < settings.maxRetries,
    attemptsLeft: Math.max(0, settings.maxRetries - placeOrderState.retryCount),
    maxAttempts: settings.maxRetries
  };
};