// Элемент корзины
export interface CartItem {
  id: number; // ID товара
  title: string;
  size: string;
  price: number; // Зафиксированная цена на момент добавления
  count: number;
  image?: string | undefined;
}

// Корзина целиком
export interface Cart {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
}

// Состояние корзины
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

// Параметры для добавления товара в корзину
export interface AddToCartParams {
  productId: number;
  title: string;
  size: string;
  price: number;
  count: number;
  image?: string | undefined;
}

// Параметры для обновления количества
export interface UpdateCartItemParams {
  productId: number;
  size: string;
  newCount: number;
}

// Ключ для идентификации элемента корзины
export interface CartItemKey {
  productId: number;
  size: string;
}

// Валидация корзины
export interface CartValidation {
  isValid: boolean;
  errors: string[];
  hasItems: boolean;
}