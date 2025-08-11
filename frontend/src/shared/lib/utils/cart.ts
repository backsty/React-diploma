// Типы для корзины
interface CartItemSimple {
  id: number;
  title: string;
  size: string;
  price: number;
  count: number;
  image?: string | undefined;
}

interface CartSimple {
  items: CartItemSimple[];
  totalCount: number;
  totalPrice: number;
}

interface CartValidationResult {
  isValid: boolean;
  errors: string[];
  hasItems: boolean;
}

// Создать уникальный ключ для позиции в корзине (товар + размер)
export const createCartItemKey = (productId: number, size: string): string => {
  return `${productId}-${size}`;
};

// Найти позицию в корзине
export const findCartItem = (items: CartItemSimple[], productId: number, size: string): CartItemSimple | undefined => {
  return items.find(item => item.id === productId && item.size === size);
};

// Подсчитать общее количество товаров
export const calculateTotalCount = (items: CartItemSimple[]): number => {
  return items.reduce((total, item) => total + item.count, 0);
};

// Подсчитать общую стоимость
export const calculateTotalPrice = (items: CartItemSimple[]): number => {
  return items.reduce((total, item) => total + (item.price * item.count), 0);
};

// Добавить товар в корзину
export const addItemToCart = (
  items: CartItemSimple[],
  productId: number,
  title: string,
  size: string,
  price: number,
  count: number,
  image?: string | undefined
): CartItemSimple[] => {
  const existingItem = findCartItem(items, productId, size);
  
  if (existingItem) {
    // Обновляем количество существующей позиции
    return items.map(item =>
      item.id === productId && item.size === size
        ? { ...item, count: Math.min(10, item.count + count) }
        : item
    );
  } else {
    // Добавляем новую позицию с правильной типизацией image
    const newItem: CartItemSimple = { 
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

// Удалить товар из корзины
export const removeItemFromCart = (items: CartItemSimple[], productId: number, size: string): CartItemSimple[] => {
  return items.filter(item => !(item.id === productId && item.size === size));
};

// Обновить количество товара в корзине
export const updateItemQuantity = (
  items: CartItemSimple[],
  productId: number,
  size: string,
  newCount: number
): CartItemSimple[] => {
  if (newCount <= 0) {
    return removeItemFromCart(items, productId, size);
  }
  
  return items.map(item =>
    item.id === productId && item.size === size
      ? { ...item, count: Math.max(1, Math.min(10, newCount)) }
      : item
  );
};

// Создать объект корзины с вычисленными значениями
export const createCart = (items: CartItemSimple[]): CartSimple => {
  return {
    items,
    totalCount: calculateTotalCount(items),
    totalPrice: calculateTotalPrice(items)
  };
};

// Очистить корзину (после успешного заказа)
export const clearCart = (): CartItemSimple[] => {
  return [];
};

// Валидация корзины перед заказом
export const validateCart = (cart: CartSimple): CartValidationResult => {
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

// Дополнительные утилиты для работы с корзиной
export const isCartEmpty = (items: CartItemSimple[]): boolean => {
  return items.length === 0;
};

export const getCartItemsCount = (items: CartItemSimple[]): number => {
  return items.length;
};

export const hasCartItem = (items: CartItemSimple[], productId: number, size: string): boolean => {
  return findCartItem(items, productId, size) !== undefined;
};

export const getCartItemQuantity = (items: CartItemSimple[], productId: number, size: string): number => {
  const item = findCartItem(items, productId, size);
  return item ? item.count : 0;
};

export type { CartItemSimple, CartSimple, CartValidationResult };