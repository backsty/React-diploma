import { STORAGE_KEYS } from '@/shared/config';
import type { CartItem } from '../model/types';

// Сохранение корзины в localStorage
export const saveCartToStorage = (items: CartItem[]): void => {
  try {
    const serializedItems = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEYS.CART, serializedItems);
  } catch (error) {
    console.error('Ошибка сохранения корзины в localStorage:', error);
  }
};

// Загрузка корзины из localStorage
export const loadCartFromStorage = (): CartItem[] => {
  try {
    const storedItems = localStorage.getItem(STORAGE_KEYS.CART);
    if (!storedItems) {
      return [];
    }
    
    const parsedItems = JSON.parse(storedItems);
    
    if (!Array.isArray(parsedItems)) {
      console.warn('Некорректные данные корзины в localStorage');
      return [];
    }
    
    // Проверяем каждый элемент
    const validItems = parsedItems.filter((item): item is CartItem => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'number' &&
        typeof item.title === 'string' &&
        typeof item.size === 'string' &&
        typeof item.price === 'number' &&
        typeof item.count === 'number' &&
        item.count > 0 &&
        (item.image === undefined || typeof item.image === 'string')
      );
    });
    
    return validItems;
  } catch (error) {
    console.error('Ошибка загрузки корзины из localStorage:', error);
    return [];
  }
};

// Очистка корзины из localStorage
export const clearCartFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CART);
  } catch (error) {
    console.error('Ошибка очистки корзины из localStorage:', error);
  }
};

// Проверка доступности localStorage
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};