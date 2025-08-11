export const CART_STORAGE_KEY = 'bosa-noga-cart';

export const VALIDATION = {
  PHONE_PATTERN: /^(\+7|8)[\d\s\-()]{10,15}$/,
  ADDRESS_MIN_LENGTH: parseInt(import.meta.env.VITE_ADDRESS_MIN_LENGTH || '10', 10),
  MIN_QUANTITY: parseInt(import.meta.env.VITE_MIN_QUANTITY || '1', 10),
  MAX_QUANTITY: parseInt(import.meta.env.VITE_MAX_QUANTITY || '10', 10),
} as const;

export const UI_CONFIG = {
  NOTIFICATION_DURATION: parseInt(import.meta.env.VITE_NOTIFICATION_DURATION || '3000', 10),
  LOADER_MIN_TIME: parseInt(import.meta.env.VITE_LOADER_MIN_TIME || '500', 10),
} as const;

export const MESSAGES = {
  LOADING: 'Загрузка...',
  ERROR_GENERIC: 'Произошла ошибка. Попробуйте позже.',
  ERROR_NETWORK: 'Ошибка сети. Проверьте подключение к интернету.',
  ERROR_404: 'Страница не найдена',
  CART_EMPTY: 'Корзина пуста',
  CART_ADDED: 'Товар добавлен в корзину',
  ORDER_SUCCESS: 'Заказ успешно оформлен!',
  ORDER_PROCESSING: 'Оформление заказа...',
  SEARCH_NO_RESULTS: 'По вашему запросу ничего не найдено',
  SEARCH_PLACEHOLDER: 'Поиск',
  SIZE_REQUIRED: 'Выберите размер',
  QUANTITY_INVALID: 'Количество должно быть от 1 до 10',
  PHONE_INVALID: 'Неверный формат телефона',
  ADDRESS_REQUIRED: 'Введите адрес доставки',
} as const;