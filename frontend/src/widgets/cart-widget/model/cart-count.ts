import { atom } from '@reatom/core';
import { cartAtom } from '@/shared/store';

// Атом для подсчета количества позиций в корзине
export const cartItemsCountAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  return cart.items.length;
}, 'cartItemsCount');

// Атом для подсчета общего количества товаров в корзине
export const cartTotalQuantityAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  return cart.items.reduce((total, item) => total + item.count, 0);
}, 'cartTotalQuantity');

// Атом для проверки, есть ли товары в корзине
export const hasCartItemsAtom = atom((ctx) => {
  const cart = ctx.spy(cartAtom);
  return cart.items.length > 0;
}, 'hasCartItems');