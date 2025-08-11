import { atom } from '@reatom/core';
import { withLocalStorage } from '@reatom/persist-web-storage';

// Интерфейс для конфигурации персистентности
interface PersistConfig {
  key: string;
  serialize?: (value: unknown) => string;
  deserialize?: (value: string) => unknown;
}

export const createPersistedAtom = <T>(
  initialValue: T,
  storageKey: string,
  atomName: string
) => {
  const baseAtom = atom(initialValue, atomName);

  return baseAtom.pipe(
    withLocalStorage(storageKey)
  );
};

// Специализированный хелпер для корзины с валидацией
export const createPersistedCartAtom = <T>(
  initialValue: T,
  storageKey: string
) => {
  const baseAtom = atom(initialValue, 'persistedCart');
  
  // Применяем базовую персистентность
  const persistedAtom = baseAtom.pipe(
    withLocalStorage(storageKey)
  );
  
  // Добавляем валидацию через отдельный атом
  return atom((ctx) => {
    const value = ctx.spy(persistedAtom);
    
    // Валидация данных из localStorage
    try {
      if (Array.isArray(value)) {
        return value as T;
      }
      return initialValue;
    } catch (error) {
      console.warn('Ошибка валидации данных корзины:', error);
      return initialValue;
    }
  }, 'validatedCart');
};

// Инициализация системы персистентности
export const initPersistence = (): void => {
  // eslint-disable-next-line no-console
  console.log('🔄 Система персистентности инициализирована');
  
  // Проверяем доступность localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    // eslint-disable-next-line no-console
    console.log('✅ localStorage доступен');
  } else {
    console.warn('⚠️ localStorage недоступен');
  }
};

// Очистка персистентных данных
export const clearPersistedData = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      // eslint-disable-next-line no-console
      console.log(`🧹 Очищены данные для ключа: ${key}`);
    }
  } catch (error) {
    console.warn(`Ошибка очистки данных для ключа ${key}:`, error);
  }
};

// Получение персистентных данных
export const getPersistedData = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Ошибка получения данных для ключа ${key}:`, error);
    return defaultValue;
  }
};

// Сохранение персистентных данных
export const setPersistedData = <T>(key: string, value: T): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    window.localStorage.setItem(key, JSON.stringify(value));
    // eslint-disable-next-line no-console
    console.log(`💾 Сохранены данные для ключа: ${key}`);
  } catch (error) {
    console.warn(`Ошибка сохранения данных для ключа ${key}:`, error);
  }
};

// Хелпер для получения размера данных в localStorage
export const getStorageSize = (): number => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0;
    }
    
    let total = 0;
    for (const key in window.localStorage) {
      if (Object.prototype.hasOwnProperty.call(window.localStorage, key)) {
        const value = window.localStorage.getItem(key);
        if (value) {
          total += key.length + value.length;
        }
      }
    }
    
    return total;
  } catch (error) {
    console.warn('Ошибка получения размера localStorage:', error);
    return 0;
  }
};

// Хелпер для очистки всего localStorage (осторожно!)
export const clearAllPersistedData = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
      // eslint-disable-next-line no-console
      console.log('🧹 Весь localStorage очищен');
    }
  } catch (error) {
    console.warn('Ошибка очистки localStorage:', error);
  }
};

// Хелпер для проверки доступности localStorage
export const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export type { PersistConfig };