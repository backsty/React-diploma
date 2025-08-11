import { z } from 'zod';
import { VALIDATION } from '../utils/constants';

// Схема для телефона (более строгая валидация)
export const phoneSchema = z
  .string()
  .min(1, 'Телефон обязателен')
  .regex(VALIDATION.PHONE_PATTERN, 'Неверный формат телефона')
  .transform((val) => val.replace(/\D/g, '')) // Очищаем от лишних символов
  .refine((val) => val.length >= 10, 'Телефон должен содержать минимум 10 цифр');

// Схема для адреса
export const addressSchema = z
  .string()
  .min(1, 'Адрес обязателен')
  .min(VALIDATION.ADDRESS_MIN_LENGTH, `Адрес должен содержать минимум ${VALIDATION.ADDRESS_MIN_LENGTH} символов`)
  .trim();

// Схема для количества товара
export const quantitySchema = z
  .number()
  .int('Количество должно быть целым числом')
  .min(VALIDATION.MIN_QUANTITY, `Минимальное количество: ${VALIDATION.MIN_QUANTITY}`)
  .max(VALIDATION.MAX_QUANTITY, `Максимальное количество: ${VALIDATION.MAX_QUANTITY}`);

// Схема для размера
export const sizeSchema = z
  .string()
  .min(1, 'Выберите размер')
  .trim();

// Схема для поиска
export const searchSchema = z
  .string()
  .trim()
  .optional();

// Схема для формы заказа
export const orderFormSchema = z.object({
  phone: phoneSchema,
  address: addressSchema
});

// Схема для добавления в корзину
export const addToCartSchema = z.object({
  size: sizeSchema,
  quantity: quantitySchema
});

// Схема для товара ID
export const productIdSchema = z
  .number()
  .int('ID товара должен быть целым числом')
  .positive('ID товара должен быть положительным');

// Типы из схем
export type OrderFormData = z.infer<typeof orderFormSchema>;
export type AddToCartData = z.infer<typeof addToCartSchema>;
export type SearchData = z.infer<typeof searchSchema>;