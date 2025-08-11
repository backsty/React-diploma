import { useState } from 'react';
import { useAtom } from '@reatom/npm-react';
import { Button, ErrorMessage } from '@/shared/ui';
import { 
  handleRemoveFromCartAction,
  handleUpdateCartQuantityAction,
  removeFromCartSelector,
  canRemoveItem,
  canUpdateQuantity,
  resetRemoveFromCartStateAction
} from '../model/remove-from-cart';
import { ctx } from '@/shared/store';
import type { CartItem } from '@/entities/cart';

export interface RemoveButtonProps {
  item: CartItem;
  variant?: 'icon' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  confirmRemoval?: boolean;
  onRemoved?: ((removedItem: CartItem) => void) | undefined;
  disabled?: boolean;
}

export const RemoveButton = ({
  item,
  variant = 'icon',
  size = 'sm',
  className = '',
  confirmRemoval = false,
  onRemoved,
  disabled = false
}: RemoveButtonProps) => {
  const [removeState] = useAtom(removeFromCartSelector);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Проверяем, удаляется ли именно этот товар
  const isBeingRemoved = removeState.isRemoving && removeState.removingItemId === String(item.id);
  const isDisabled = disabled || isBeingRemoved || !canRemoveItem(item);
  
  const handleRemove = async () => {
    if (isDisabled) return;
    
    if (confirmRemoval && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    const result = await handleRemoveFromCartAction(ctx, item);
    
    if (result.success) {
      if (onRemoved) {
        onRemoved(result.removedItem!);
      }
      
      setShowConfirm(false);
      
      // Сбрасываем состояние через некоторое время
      setTimeout(() => {
        resetRemoveFromCartStateAction(ctx);
      }, 2000);
    }
  };
  
  const handleCancel = () => {
    setShowConfirm(false);
  };
  
  if (showConfirm) {
    return (
      <div className={`remove-confirmation ${className}`}>
        <div className="alert alert-warning p-2" role="alert">
          <div className="d-flex flex-column gap-2">
            <small className="mb-0">
              Удалить <strong>{item.title}</strong> из корзины?
            </small>
            <div className="d-flex gap-2">
              <Button
                variant="secondary" // Заменили danger на secondary
                size="sm"
                onClick={handleRemove}
                disabled={isBeingRemoved}
                loading={isBeingRemoved}
              >
                Удалить
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={isBeingRemoved}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const getButtonContent = () => {
    if (isBeingRemoved) {
      return variant === 'icon' ? '⏳' : 'Удаляем...';
    }
    
    switch (variant) {
      case 'icon':
        return '✕';
      case 'text':
        return 'Удалить';
      case 'danger':
        return 'Удалить из корзины';
      default:
        return '✕';
    }
  };
  
  const getButtonVariant = (): 'primary' | 'secondary' | 'outline' | 'link' => {
    if (variant === 'danger') return 'secondary'; // Заменили danger на secondary
    if (variant === 'text') return 'outline';
    return 'link';
  };
  
  return (
    <div className={`remove-button-wrapper ${className}`}>
      <Button
        variant={getButtonVariant()}
        size={size}
        onClick={handleRemove}
        disabled={isDisabled}
        loading={isBeingRemoved}
        className={`remove-button ${variant === 'icon' ? 'p-1' : ''}`}
        aria-label={`Удалить ${item.title} из корзины`}
        title={`Удалить ${item.title} из корзины`}
      >
        {getButtonContent()}
      </Button>
      
      {/* Ошибка удаления */}
      {removeState.error && removeState.removingItemId === String(item.id) && (
        <div className="mt-1">
          <ErrorMessage 
            message={removeState.error}
            variant="inline"
          />
        </div>
      )}
    </div>
  );
};

// Компонент для изменения количества товара в корзине
export interface QuantityControlProps {
  item: CartItem;
  className?: string;
  onQuantityChanged?: ((newQuantity: number) => void) | undefined;
  disabled?: boolean;
}

export const QuantityControl = ({
  item,
  className = '',
  onQuantityChanged,
  disabled = false
}: QuantityControlProps) => {
  const [removeState] = useAtom(removeFromCartSelector);
  
  // Проверяем, обновляется ли именно этот товар
  const isBeingUpdated = removeState.isRemoving && removeState.removingItemId === String(item.id);
  const isDisabled = disabled || isBeingUpdated;
  
  const handleQuantityChange = async (newCount: number) => {
    if (isDisabled) return;
    
    const validation = canUpdateQuantity(item, newCount);
    if (!validation.canUpdate) {
      return;
    }
    
    if (newCount === 0) {
      // Если количество 0, удаляем товар
      await handleRemoveFromCartAction(ctx, item);
      return;
    }
    
    const result = await handleUpdateCartQuantityAction(ctx, String(item.id), newCount);
    
    if (result.success && onQuantityChanged) {
      onQuantityChanged(result.newCount!);
    }
  };
  
  const handleDecrement = () => {
    handleQuantityChange(item.count - 1);
  };
  
  const handleIncrement = () => {
    handleQuantityChange(item.count + 1);
  };
  
  return (
    <div className={`quantity-control d-flex align-items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={isDisabled || item.count <= 1}
        aria-label="Уменьшить количество"
        className="px-2"
      >
        −
      </Button>
      
      <span className="quantity-display px-2 text-center" style={{ minWidth: '40px' }}>
        {isBeingUpdated ? '...' : item.count}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={isDisabled || item.count >= 10}
        aria-label="Увеличить количество"
        className="px-2"
      >
        +
      </Button>
      
      {/* Ошибка обновления количества */}
      {removeState.error && removeState.removingItemId === String(item.id) && (
        <div className="ms-2">
          <ErrorMessage 
            message={removeState.error}
            variant="inline"
          />
        </div>
      )}
    </div>
  );
};

// Кнопка для полной очистки корзины
export interface ClearCartButtonProps {
  className?: string;
  onCleared?: (() => void) | undefined;
  confirmClear?: boolean;
}

export const ClearCartButton = ({
  className = '',
  // onCleared, // Закомментируем неиспользуемый параметр
  confirmClear = true
}: ClearCartButtonProps) => {
  const [removeState] = useAtom(removeFromCartSelector);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const isDisabled = removeState.isRemoving;
  
  const handleClear = async () => {
    if (isDisabled) return;
    
    if (confirmClear && !showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    // const result = await handleClearCartAction(ctx);
    
    // if (result.success && onCleared) {
    //   onCleared();
    // }
    
    setShowConfirm(false);
  };
  
  const handleCancel = () => {
    setShowConfirm(false);
  };
  
  if (showConfirm) {
    return (
      <div className={`clear-cart-confirmation ${className}`}>
        <div className="alert alert-warning" role="alert">
          <div className="d-flex justify-content-between align-items-center">
            <span>Очистить всю корзину?</span>
            <div className="d-flex gap-2">
              <Button
                variant="secondary" // Заменили danger на secondary
                size="sm"
                onClick={handleClear}
                disabled={isDisabled}
              >
                Очистить
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancel}
                disabled={isDisabled}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClear}
      disabled={isDisabled}
      className={`clear-cart-button ${className}`}
      aria-label="Очистить корзину"
    >
      Очистить корзину
    </Button>
  );
};