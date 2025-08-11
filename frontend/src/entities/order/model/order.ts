import { atom, action, Ctx } from '@reatom/core';
import type { OrderState, OrderFormData, OrderValidation } from './types';

// Атом для состояния заказа
export const orderStateAtom = atom<OrderState>({
  isLoading: false,
  isSuccess: false,
  error: null,
  lastOrderId: undefined
}, 'orderState');

// Атом для данных формы заказа
export const orderFormAtom = atom<OrderFormData>({
  phone: '',
  address: '',
  agreement: false
}, 'orderForm');

// Actions для управления состоянием заказа
export const setOrderLoadingAction = action((ctx: Ctx, isLoading: boolean) => {
  const current = ctx.get(orderStateAtom);
  orderStateAtom(ctx, { ...current, isLoading });
}, 'setOrderLoading');

export const setOrderSuccessAction = action((ctx: Ctx, orderId?: string | undefined) => {
  orderStateAtom(ctx, {
    isLoading: false,
    isSuccess: true,
    error: null,
    lastOrderId: orderId || undefined
  });
}, 'setOrderSuccess');

export const setOrderErrorAction = action((ctx: Ctx, error: string) => {
  const current = ctx.get(orderStateAtom);
  orderStateAtom(ctx, { 
    ...current, 
    error, 
    isLoading: false, 
    isSuccess: false,
    lastOrderId: undefined
  });
}, 'setOrderError');

export const resetOrderStateAction = action((ctx: Ctx) => {
  orderStateAtom(ctx, {
    isLoading: false,
    isSuccess: false,
    error: null,
    lastOrderId: undefined
  });
}, 'resetOrderState');

// Actions для формы заказа
export const updateOrderFormAction = action((ctx: Ctx, data: Partial<OrderFormData>) => {
  const current = ctx.get(orderFormAtom);
  orderFormAtom(ctx, { ...current, ...data });
}, 'updateOrderForm');

export const resetOrderFormAction = action((ctx: Ctx) => {
  orderFormAtom(ctx, {
    phone: '',
    address: '',
    agreement: false
  });
}, 'resetOrderForm');

// Селекторы с правильной типизацией ctx
export const orderStateSelector = atom((ctx) => {
  return ctx.spy(orderStateAtom);
}, 'orderStateSelector');

export const orderFormSelector = atom((ctx) => {
  return ctx.spy(orderFormAtom);
}, 'orderFormSelector');

// Валидация формы заказа
export const orderFormValidationAtom = atom((ctx) => {
  const form = ctx.spy(orderFormAtom);
  
  const validation: OrderValidation = {
    isValid: true,
    errors: {}
  };
  
  // Валидация телефона
  if (!form.phone.trim()) {
    validation.errors.phone = 'Введите номер телефона';
    validation.isValid = false;
  } else {
    // Очищаем номер от пробелов и дефисов для валидации (исправлены ESLint ошибки)
    const cleanPhone = form.phone.replace(/[\s\-()]/g, '');
    
    // Проверяем формат российского номера
    if (!/^\+7\d{10}$/.test(cleanPhone) && !/^8\d{10}$/.test(cleanPhone) && !/^7\d{10}$/.test(cleanPhone)) {
      validation.errors.phone = 'Введите корректный номер телефона (например: +7 XXX XXX-XX-XX)';
      validation.isValid = false;
    }
  }
  
  // Валидация адреса
  if (!form.address.trim()) {
    validation.errors.address = 'Введите адрес доставки';
    validation.isValid = false;
  } else if (form.address.trim().length < 10) {
    validation.errors.address = 'Адрес должен содержать не менее 10 символов';
    validation.isValid = false;
  }
  
  // Проверка согласия с условиями
  if (!form.agreement) {
    validation.isValid = false;
  }
  
  return validation;
}, 'orderFormValidation');

// Проверка готовности формы к отправке
export const isOrderFormReadyAtom = atom((ctx) => {
  const validation = ctx.spy(orderFormValidationAtom);
  return validation.isValid;
}, 'isOrderFormReady');

// Дополнительные селекторы
export const orderLoadingAtom = atom((ctx) => {
  const state = ctx.spy(orderStateAtom);
  return state.isLoading;
}, 'orderLoading');

export const orderSuccessAtom = atom((ctx) => {
  const state = ctx.spy(orderStateAtom);
  return state.isSuccess;
}, 'orderSuccess');

export const orderErrorAtom = atom((ctx) => {
  const state = ctx.spy(orderStateAtom);
  return state.error;
}, 'orderError');

export const lastOrderIdAtom = atom((ctx) => {
  const state = ctx.spy(orderStateAtom);
  return state.lastOrderId || null;
}, 'lastOrderId');

// Утилитарные функции с исправленными регулярными выражениями
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return /^\+7\d{10}$/.test(cleanPhone) || /^8\d{10}$/.test(cleanPhone) || /^7\d{10}$/.test(cleanPhone);
};

export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  if (cleanPhone.startsWith('8')) {
    return '+7' + cleanPhone.slice(1);
  }
  
  if (cleanPhone.startsWith('7')) {
    return '+' + cleanPhone;
  }
  
  return phone;
};

export const isValidAddress = (address: string): boolean => {
  return address.trim().length >= 10;
};