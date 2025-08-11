import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from '@reatom/npm-react';
import { Button, ErrorMessage } from '@/shared/ui';
import { ROUTES } from '@/shared/config';
import { 
  handleAddToCartAction, 
  addToCartSelector,
  validateAddToCartForm,
  resetAddToCartStateAction
} from '../model/add-to-cart';
import { SizeSelector } from './size-selector';
import { QuantitySelector } from './quantity-selector';
import { ctx } from '@/shared/store';
import type { Product } from '@/entities/product';

export interface AddToCartFormProps {
  product: Product;
  className?: string;
  onSuccess?: (() => void) | undefined;
  redirectOnSuccess?: boolean;
  showQuantitySelector?: boolean;
}

export const AddToCartForm = ({
  product,
  className = '',
  onSuccess,
  redirectOnSuccess = true,
  showQuantitySelector = true
}: AddToCartFormProps) => {
  const navigate = useNavigate();
  const [addToCartState] = useAtom(addToCartSelector);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const hasAvailableSizes = product.sizes.some(size => size.available);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация формы
    const validation = validateAddToCartForm(ctx, product.id, product);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    // Очищаем ошибки валидации
    setValidationErrors([]);
    
    // Добавляем товар в корзину
    const result = await handleAddToCartAction(ctx, product);
    
    if (result.success) {
      // Успешное добавление
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectOnSuccess) {
        navigate(ROUTES.CART);
      }
      
      // Сбрасываем состояние через некоторое время
      setTimeout(() => {
        resetAddToCartStateAction(ctx);
      }, 3000);
    }
  };
  
  if (!hasAvailableSizes) {
    return (
      <div className={`add-to-cart-form unavailable ${className}`}>
        <div className="alert alert-warning" role="alert">
          <h6>Товар временно недоступен</h6>
          <p className="mb-0 small">
            К сожалению, все размеры данного товара закончились.
            Попробуйте позже или выберите другой товар.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <form 
      className={`add-to-cart-form ${className}`}
      onSubmit={handleSubmit}
    >
      {/* Селектор размеров */}
      <div className="mb-3">
        <SizeSelector
          productId={product.id}
          sizes={product.sizes}
          disabled={addToCartState.isAdding}
        />
      </div>
      
      {/* Селектор количества */}
      {showQuantitySelector && (
        <div className="mb-3">
          <QuantitySelector
            productId={product.id}
            disabled={addToCartState.isAdding}
          />
        </div>
      )}
      
      {/* Ошибки валидации */}
      {validationErrors.length > 0 && (
        <div className="mb-3">
          <ErrorMessage message="Ошибка валидации">
            <ul className="mb-0">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </ErrorMessage>
        </div>
      )}
      
      {/* Ошибка добавления */}
      {addToCartState.error && (
        <div className="mb-3">
          <ErrorMessage message={addToCartState.error} />
        </div>
      )}
      
      {/* Кнопка добавления в корзину */}
      <div className="text-center">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="px-5"
          disabled={addToCartState.isAdding}
          loading={addToCartState.isAdding}
          aria-label={`Добавить ${product.title} в корзину`}
        >
          {addToCartState.isAdding ? 'Добавляем...' : 'В корзину'}
        </Button>
      </div>
      
      {/* Сообщение об успехе */}
      {addToCartState.lastAddedProductId === product.id && !addToCartState.isAdding && !addToCartState.error && (
        <div className="alert alert-success mt-3" role="alert">
          <small>✅ Товар добавлен в корзину!</small>
        </div>
      )}
    </form>
  );
};