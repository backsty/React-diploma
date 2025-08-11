import { atom, action } from '@reatom/core';
import { withLocalStorage } from '@reatom/persist-web-storage';

const CART_STORAGE_KEY = 'bosa-noga-cart';

interface CartItem {
  id: number;
  title: string;
  size: string;
  price: number;
  count: number;
  image: string | undefined;
}

interface CartState {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
}

/**
 * Утилиты для работы с корзиной
 */
const findCartItem = (items: CartItem[], productId: number, size: string): CartItem | undefined => {
  return items.find(item => item.id === productId && item.size === size);
};

const calculateTotalCount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.count, 0);
};

const calculateTotalPrice = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.count), 0);
};

const createCartState = (items: CartItem[]): CartState => {
  return {
    items,
    totalCount: calculateTotalCount(items),
    totalPrice: calculateTotalPrice(items)
  };
};

const addItemToCart = (
  items: CartItem[],
  productId: number,
  title: string,
  size: string,
  price: number,
  count: number,
  image?: string
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
      image
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

const clearCartItems = (): CartItem[] => {
  return [];
};

const validateCart = (cart: CartState) => {
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

/**
 * Основные атомы корзины
 */
export const cartItemsAtom = atom<CartItem[]>([], 'cartItems').pipe(
  withLocalStorage(CART_STORAGE_KEY)
);

export const cartAtom = atom((ctx) => {
  const items = ctx.spy(cartItemsAtom);
  return createCartState(items);
}, 'cart');

export const cartCountAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  return cart.totalCount;
}, 'cartCount');

export const cartTotalAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  return cart.totalPrice;
}, 'cartTotal');

export const cartIsEmptyAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  return cart.items.length === 0;
}, 'cartIsEmpty');

export const cartValidationAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  return validateCart(cart);
}, 'cartValidation');

/**
 * Действия для управления корзиной
 */
export const addToCartAction = action((
  ctx,
  data: {
    productId: number;
    title: string;
    size: string;
    price: number;
    count: number;
    image?: string;
  }
) => {
  const currentItems = ctx.get(cartItemsAtom);
  const newItems = addItemToCart(
    currentItems, 
    data.productId, 
    data.title, 
    data.size, 
    data.price, 
    data.count, 
    data.image
  );
  cartItemsAtom(ctx, newItems);
  
  // eslint-disable-next-line no-console
  console.log('🛒 Товар добавлен в корзину:', {
    product: data.title,
    size: data.size,
    count: data.count,
    totalItems: newItems.length
  });
  
  return newItems;
}, 'addToCart');

export const removeFromCartAction = action((
  ctx,
  productId: number,
  size: string
) => {
  const currentItems = ctx.get(cartItemsAtom);
  const itemToRemove = findCartItem(currentItems, productId, size);
  const newItems = removeItemFromCart(currentItems, productId, size);
  cartItemsAtom(ctx, newItems);
  
  if (itemToRemove) {
    // eslint-disable-next-line no-console
    console.log('🗑️ Товар удален из корзины:', {
      product: itemToRemove.title,
      size: itemToRemove.size,
      remainingItems: newItems.length
    });
  }
  
  return newItems;
}, 'removeFromCart');

export const updateCartItemAction = action((
  ctx,
  productId: number,
  size: string,
  newCount: number
) => {
  const currentItems = ctx.get(cartItemsAtom);
  const newItems = updateItemQuantity(currentItems, productId, size, newCount);
  cartItemsAtom(ctx, newItems);
  
  // eslint-disable-next-line no-console
  console.log('📝 Количество товара обновлено:', {
    productId,
    size,
    newCount,
    totalItems: newItems.length
  });
  
  return newItems;
}, 'updateCartItem');

export const clearCartAction = action((ctx) => {
  const currentItems = ctx.get(cartItemsAtom);
  const emptyItems = clearCartItems();
  cartItemsAtom(ctx, emptyItems);
  
  // eslint-disable-next-line no-console
  console.log('🧹 Корзина очищена, удалено товаров:', currentItems.length);
  
  return emptyItems;
}, 'clearCart');

export type { CartItem, CartState };