import { apiClient } from '@/shared/lib';
import { validateOrderData } from '@/entities/order';
import type { CreateOrderData, CreateOrderResponse } from '@/entities/order';

// Интерфейс для данных заказа от фичи
export interface PlaceOrderData {
  phone: string;
  address: string;
  items: Array<{
    id: number;
    price: number;
    count: number;
  }>;
}

// Результат оформления заказа
export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  validationErrors?: string[];
}

/**
 * Оформление заказа через API
 * POST /api/order
 */
export const placeOrder = async (orderData: PlaceOrderData): Promise<PlaceOrderResult> => {
  try {
    // Преобразуем данные в формат для API
    const apiOrderData: CreateOrderData = {
      owner: {
        phone: orderData.phone.trim(),
        address: orderData.address.trim()
      },
      items: orderData.items
    };
    
    // Валидация данных перед отправкой
    const validation = validateOrderData(apiOrderData);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Данные заказа некорректны',
        validationErrors: validation.errors
      };
    }
    
    // Отправляем заказ на сервер
    const response = await apiClient.post<CreateOrderResponse>('/api/order', apiOrderData);
    
    if (response.success && response.id) {
      return {
        success: true,
        orderId: response.id
      };
    } else {
      return {
        success: false,
        error: response.message || 'Не удалось оформить заказ'
      };
    }
    
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error);
    
    let errorMessage = 'Произошла ошибка при оформлении заказа';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Проверка доступности API заказов
 */
export const checkOrderApiHealth = async (): Promise<boolean> => {
  try {
    // Простая проверка доступности API
    await apiClient.get('/api/categories'); // Используем легкий endpoint
    return true;
  } catch {
    return false;
  }
};

/**
 * Форматирование номера телефона для API
 */
export const formatPhoneForApi = (phone: string): string => {
  // Убираем все нецифровые символы
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Приводим к формату +7XXXXXXXXXX
  if (digitsOnly.startsWith('8') && digitsOnly.length === 11) {
    return `+7${digitsOnly.slice(1)}`;
  }
  
  if (digitsOnly.startsWith('7') && digitsOnly.length === 11) {
    return `+${digitsOnly}`;
  }
  
  if (digitsOnly.length === 10) {
    return `+7${digitsOnly}`;
  }
  
  return phone; // Возвращаем как есть, если не удалось распознать
};

/**
 * Валидация данных заказа на клиенте
 */
export const validatePlaceOrderData = (data: PlaceOrderData): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  // Валидация телефона
  if (!data.phone.trim()) {
    errors.phone = 'Укажите номер телефона';
  } else {
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      errors.phone = 'Неполный номер телефона';
    } else if (phoneDigits.length > 11) {
      errors.phone = 'Слишком длинный номер телефона';
    }
  }
  
  // Валидация адреса
  if (!data.address.trim()) {
    errors.address = 'Укажите адрес доставки';
  } else if (data.address.trim().length < 10) {
    errors.address = 'Адрес слишком короткий (минимум 10 символов)';
  } else if (data.address.trim().length > 200) {
    errors.address = 'Адрес слишком длинный (максимум 200 символов)';
  }
  
  // Валидация товаров
  if (!data.items || data.items.length === 0) {
    errors.items = 'Корзина пуста';
  } else {
    const hasInvalidItems = data.items.some(item => 
      !item.id || 
      item.id <= 0 || 
      !item.price || 
      item.price <= 0 || 
      !item.count || 
      item.count <= 0 || 
      item.count > 10
    );
    
    if (hasInvalidItems) {
      errors.items = 'Некорректные данные товаров в корзине';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Подсчет общей стоимости заказа
 */
export const calculateOrderTotal = (items: PlaceOrderData['items']): number => {
  return items.reduce((total, item) => total + (item.price * item.count), 0);
};

/**
 * Подсчет общего количества товаров
 */
export const calculateOrderItemsCount = (items: PlaceOrderData['items']): number => {
  return items.reduce((total, item) => total + item.count, 0);
};

/**
 * Генерация краткого описания заказа для уведомлений
 */
export const generateOrderSummary = (data: PlaceOrderData): string => {
  const itemsCount = calculateOrderItemsCount(data.items);
  const total = calculateOrderTotal(data.items);
  
  return `${itemsCount} товаров на сумму ${total.toLocaleString('ru-RU')} ₽`;
};

/**
 * Retry функция для повторной отправки заказа
 */
export const retryPlaceOrder = async (
  orderData: PlaceOrderData, 
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<PlaceOrderResult> => {
  let lastError: string = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await placeOrder(orderData);
      
      if (result.success) {
        return result;
      }
      
      lastError = result.error || 'Неизвестная ошибка';
      
      // Если это не последняя попытка, ждем перед следующей
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Ошибка сети';
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  return {
    success: false,
    error: `Не удалось оформить заказ после ${maxRetries} попыток. Последняя ошибка: ${lastError}`
  };
};