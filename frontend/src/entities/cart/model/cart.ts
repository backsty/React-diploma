import { atom, action, Ctx } from '@reatom/core';
import { saveCartToStorage, loadCartFromStorage, clearCartFromStorage } from '../lib/cart-storage';
import type { 
  CartItem, 
  Cart,
  CartState, 
  AddToCartParams, 
  UpdateCartItemParams 
} from './types';

// Утилиты для работы с корзиной (локальные версии с правильными типами)
const findCartItem = (items: CartItem[], productId: number, size: string): CartItem | undefined => {
  return items.find(item => item.id === productId && item.size === size);
};

const calculateTotalCount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.count, 0);
};

const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.count), 0);
};

const addItemToCart = (
  items: CartItem[],
  productId: number,
  title: string,
  size: string,
  price: number,
  count: number,
  image?: string | undefined
): CartItem[] => {
  const existingItem = findCartItem(items, productId, size);
  
  if (existingItem) {
    return items.map(item =>
      item.id === productId && item.size === size
        ? { ...item, count: Math.min(10, item.count + count) }
        : item
    );
  } else {
    const newItem: CartItem = { 
      id: productId, 
      title, 
      size, 
      price, 
      count: Math.min(10, count),
      image: image || undefined
    };
    
    return [...items, newItem];
  }
};

const removeItemFromCart = (items: CartItem[], productId: number, size: string): CartItem[] => {
  return items.filter(item => !(item.id === productId && item.size === size));
};

const updateItemQuantity = (
  items: CartItem[],
  productId: number,
  size: string,
  newCount: number
): CartItem[] => {
  if (newCount <= 0) {
    return removeItemFromCart(items, productId, size);
  }
  
  return items.map(item =>
    item.id === productId && item.size === size
      ? { ...item, count: Math.max(1, Math.min(10, newCount)) }
      : item
  );
};

const createCart = (items: CartItem[]): Cart => {
  return {
    items,
    totalCount: calculateTotalCount(items),
    totalPrice: calculateTotalPrice(items)
  };
};

const clearCart = (): CartItem[] => {
  return [];
};

const validateCart = (cart: Cart) => {
  const errors: string[] = [];
  
  if (cart.items.length === 0) {
    errors.push('Корзина пуста');
  }
  
  cart.items.forEach((item, index) => {
    if (item.count < 1 || item.count > 10) {
      errors.push(`Неверное количество для товара ${index + 1}`);
    }
    if (!item.size || item.size.trim().length === 0) {
      errors.push(`Не выбран размер для товара ${index + 1}`);
    }
    if (!item.title || item.title.trim().length === 0) {
      errors.push(`Отсутствует название товара ${index + 1}`);
    }
    if (item.price <= 0) {
      errors.push(`Неверная цена для товара ${index + 1}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    hasItems: cart.items.length > 0
  };
};

// Атом для элементов корзины
export const cartItemsAtom = atom<CartItem[]>([], 'cartItems');

// Атом для состояния корзины
export const cartStateAtom = atom<CartState>({
  items: [],
  isLoading: false,
  error: null
}, 'cartState');

// Инициализация корзины из localStorage
export const initCartAction = action((ctx: Ctx) => {
  const storedItems = loadCartFromStorage();
  cartItemsAtom(ctx, storedItems);
  
  const currentState = ctx.get(cartStateAtom);
  cartStateAtom(ctx, { ...currentState, items: storedItems });
}, 'initCart');

// Действия для корзины
export const addToCartAction = action((ctx: Ctx, params: AddToCartParams) => {
  const currentItems = ctx.get(cartItemsAtom);
  const newItems = addItemToCart(
    currentItems, 
    params.productId, 
    params.title, 
    params.size, 
    params.price, 
    params.count, 
    params.image
  );
  
  cartItemsAtom(ctx, newItems);
  saveCartToStorage(newItems);
  
  // Обновляем состояние
  const currentState = ctx.get(cartStateAtom);
  cartStateAtom(ctx, { ...currentState, items: newItems, error: null });
  
  return newItems;
}, 'addToCart');

export const removeFromCartAction = action((ctx: Ctx, productId: number, size: string) => {
  const currentItems = ctx.get(cartItemsAtom);
  const newItems = removeItemFromCart(currentItems, productId, size);
  
  cartItemsAtom(ctx, newItems);
  saveCartToStorage(newItems);
  
  // Обновляем состояние
  const currentState = ctx.get(cartStateAtom);
  cartStateAtom(ctx, { ...currentState, items: newItems, error: null });
  
  return newItems;
}, 'removeFromCart');

export const updateCartItemAction = action((ctx: Ctx, params: UpdateCartItemParams) => {
  const currentItems = ctx.get(cartItemsAtom);
  const newItems = updateItemQuantity(currentItems, params.productId, params.size, params.newCount);
  
  cartItemsAtom(ctx, newItems);
  saveCartToStorage(newItems);
  
  // Обновляем состояние
  const currentState = ctx.get(cartStateAtom);
  cartStateAtom(ctx, { ...currentState, items: newItems, error: null });
  
  return newItems;
}, 'updateCartItem');

export const clearCartAction = action((ctx: Ctx) => {
  const emptyItems = clearCart();
  cartItemsAtom(ctx, emptyItems);
  clearCartFromStorage();
  
  // Обновляем состояние
  const currentState = ctx.get(cartStateAtom);
  cartStateAtom(ctx, { ...currentState, items: emptyItems, error: null });
  
  return emptyItems;
}, 'clearCart');

export const setCartLoadingAction = action((ctx: Ctx, isLoading: boolean) => {
  const currentState = ctx.get(cartStateAtom);
  cartStateAtom(ctx, { ...currentState, isLoading });
}, 'setCartLoading');

export const setCartErrorAction = action((ctx: Ctx, error: string) => {
  const currentState = ctx.get(cartStateAtom);
  cartStateAtom(ctx, { ...currentState, error, isLoading: false });
}, 'setCartError');

// Селекторы с правильным типированием ctx
export const cartAtom = atom((ctx): Cart => {
  const items = ctx.spy(cartItemsAtom);
  return createCart(items);
}, 'cart');

export const cartCountAtom = atom((ctx): number => {
  const cart = ctx.spy(cartAtom);
  return cart.totalCount;
}, 'cartCount');

export const cartTotalAtom = atom((ctx): number => {
  const cart = ctx.spy(cartAtom);
  return cart.totalPrice;
}, 'cartTotal');

export const cartIsEmptyAtom = atom((ctx): boolean => {
  const cart = ctx.spy(cartAtom);
  return cart.items.length === 0;
}, 'cartIsEmpty');

export const cartValidationAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  return validateCart(cart);
}, 'cartValidation');

export const cartItemsListAtom = atom((ctx): CartItem[] => {
  return ctx.spy(cartItemsAtom);
}, 'cartItemsList');

export const cartStateSelector = atom((ctx): CartState => {
  return ctx.spy(cartStateAtom);
}, 'cartStateSelector');

// Утилитарные функции для получения элементов корзины
export const getCartItem = (ctx: Ctx, productId: number, size: string): CartItem | null => {
  const items = ctx.get(cartItemsAtom);
  return items.find(item => item.id === productId && item.size === size) || null;
};

export const isInCart = (ctx: Ctx, productId: number, size: string): boolean => {
  const items = ctx.get(cartItemsAtom);
  return items.some(item => item.id === productId && item.size === size);
};