const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '₽';

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('ru-RU')} ${CURRENCY_SYMBOL}`;
};

// Форматирование телефона
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
};

// Форматирование даты
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU');
};

// Форматирование числа с разделителями
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ru-RU');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};