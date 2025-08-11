// Владелец заказа
export interface OrderOwner {
  phone: string;
  address: string;
}

// Элемент заказа
export interface OrderItem {
  id: number;
  price: number;
  count: number;
}

// Данные для создания заказа
export interface CreateOrderData {
  owner: OrderOwner;
  items: OrderItem[];
}

// Состояние заказа
export interface OrderState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  lastOrderId?: string | undefined;
}

// Валидация данных заказа
export interface OrderValidation {
  isValid: boolean;
  errors: {
    phone?: string | undefined;
    address?: string | undefined;
    items?: string | undefined;
  };
}

// Форма заказа
export interface OrderFormData {
  phone: string;
  address: string;
  agreement: boolean;
}

// Ответ от API при создании заказа
export interface CreateOrderResponse {
  success: boolean;
  id?: string | undefined;
  message?: string | undefined;
}

// Параметры для преобразования корзины в заказ
export interface CartToOrderItem {
  id: number;
  price: number;
  count: number;
}