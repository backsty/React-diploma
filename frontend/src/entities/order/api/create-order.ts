import { apiClient } from '@/shared/lib';
import type { CreateOrderData, CreateOrderResponse, CartToOrderItem } from '../model/types';

// Создание заказа
export const createOrder = async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
  try {
    // Отправляем POST запрос на сервер через общий API клиент
    const response = await apiClient.post<CreateOrderResponse>('/api/order', orderData);
    
    return response;
  } catch (error) {
    // Обрабатываем ошибки
    if (error instanceof Error) {
      throw new Error(`Ошибка создания заказа: ${error.message}`);
    }
    
    throw new Error('Неизвестная ошибка при создании заказа');
  }
};

// Утилита для преобразования корзины в элементы заказа
export const cartToOrderItems = (cartItems: CartToOrderItem[]): CreateOrderData['items'] => {
  return cartItems.map(item => ({
    id: item.id,
    price: item.price,
    count: item.count
  }));
};

// Валидация данных заказа перед отправкой
export const validateOrderData = (orderData: CreateOrderData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Проверяем данные владельца
  if (!orderData.owner.phone?.trim()) {
    errors.push('Не указан номер телефона');
  }
  
  if (!orderData.owner.address?.trim()) {
    errors.push('Не указан адрес доставки');
  }
  
  // Проверяем элементы заказа
  if (!orderData.items || orderData.items.length === 0) {
    errors.push('Корзина пуста');
  }
  
  orderData.items?.forEach((item, index) => {
    if (!item.id || item.id <= 0) {
      errors.push(`Некорректный ID товара в позиции ${index + 1}`);
    }
    
    if (!item.price || item.price <= 0) {
      errors.push(`Некорректная цена товара в позиции ${index + 1}`);
    }
    
    if (!item.count || item.count <= 0 || item.count > 10) {
      errors.push(`Некорректное количество товара в позиции ${index + 1}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Подсчет общей стоимости заказа
export const calculateOrderTotal = (items: CreateOrderData['items']): number => {
  return items.reduce((total, item) => total + (item.price * item.count), 0);
};

// Подсчет общего количества товаров в заказе
export const calculateOrderItemsCount = (items: CreateOrderData['items']): number => {
  return items.reduce((total, item) => total + item.count, 0);
};