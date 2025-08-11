import { 
  isLocalStorageAvailable, 
  getStorageSize, 
  initPersistence 
} from './persist';

// Экспорт контекста
export { ctx } from './ctx';
export type { AppCtx } from './ctx';

// Экспорт конфигурации контекста
export { CTX_CONFIG } from './ctx';

// Экспорт корзины
export {
  // Атомы состояния
  cartItemsAtom,
  cartAtom,
  cartCountAtom,
  cartTotalAtom,
  cartIsEmptyAtom,
  cartValidationAtom,
  
  // Действия
  addToCartAction,
  removeFromCartAction,
  updateCartItemAction,
  clearCartAction
} from './cart';

// Экспорт типов корзины
export type { CartItem, CartState } from './cart';

// Экспорт утилит персистентности
export {
  createPersistedAtom,
  createPersistedCartAtom,
  initPersistence,
  clearPersistedData,
  getPersistedData,
  setPersistedData,
  getStorageSize,
  clearAllPersistedData,
  isLocalStorageAvailable
} from './persist';

// Экспорт типов персистентности
export type { PersistConfig } from './persist';

// Константы для отладки
export const STORE_VERSION = '1.0.0';
export const STORE_DEBUG = process.env.NODE_ENV === 'development';

// Хелпер для отладки состояния store
export const getStoreDebugInfo = () => {
  if (!STORE_DEBUG) {
    return null;
  }
  
  return {
    version: STORE_VERSION,
    storageAvailable: isLocalStorageAvailable(),
    storageSize: getStorageSize(),
    timestamp: new Date().toISOString()
  };
};

// Функция для инициализации store
export const initializeStore = () => {
  // Инициализируем персистентность
  initPersistence();
  
  // Логирование в dev режиме
  if (STORE_DEBUG) {
    // eslint-disable-next-line no-console
    console.log('🏪 Store инициализирован:', getStoreDebugInfo());
  }
};