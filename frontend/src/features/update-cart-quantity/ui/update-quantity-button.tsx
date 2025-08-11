import { useState, useEffect } from 'react';
import { useAtom } from '@reatom/npm-react';
import { Button, Input, Loader } from '@/shared/ui';
import { formatPrice } from '@/shared/lib';
import { cartAtom } from '@/shared/store';
import {
  updatingItemIdAtom,
  updateQuantityErrorAtom,
  canUndoAtom,
  lastOperationAtom,
  increaseQuantityAction,
  decreaseQuantityAction,
  setQuantityAction,
  undoLastOperationAction,
  validateQuantity,
  canIncreaseQuantity,
  canDecreaseQuantity,
  getQuantityLimits,
  getItemQuantity
} from '../model/update-quantity';
import { ctx } from '@/shared/store';

export interface UpdateQuantityButtonProps {
  itemId: string;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  showPrice?: boolean;
  showUndo?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  allowManualInput?: boolean;
}

export const UpdateQuantityButton = ({
  itemId,
  className = '',
  variant = 'default',
  showPrice = false,
  showUndo = false,
  disabled = false,
  min = 1,
  max = 10,
  allowManualInput = false
}: UpdateQuantityButtonProps) => {
  const [cart] = useAtom(cartAtom);
  const [updatingItemId] = useAtom(updatingItemIdAtom);
  const [updateError] = useAtom(updateQuantityErrorAtom);
  const [canUndo] = useAtom(canUndoAtom);
  const [lastOperation] = useAtom(lastOperationAtom);
  
  const [manualInput, setManualInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  
  const item = cart.items.find(item => item.id === parseInt(itemId, 10));
  const isItemUpdating = updatingItemId === itemId;
  const currentQuantity = item?.count || 0;
  const totalPrice = item ? item.price * item.count : 0;
  
  // Определяем лимиты
  const limits = getQuantityLimits(ctx);
  const minQuantity = Math.max(min, limits.min);
  const maxQuantity = Math.min(max, limits.max);
  
  // Сброс локальной ошибки при изменении количества
  useEffect(() => {
    if (localError) {
      setLocalError('');
    }
  }, [currentQuantity, localError]);
  
  // Обработчики кнопок +/-
  const handleIncrease = async () => {
    if (disabled || isItemUpdating || !canIncreaseQuantity(ctx, itemId)) {
      return;
    }
    
    setLocalError('');
    
    try {
      const result = await increaseQuantityAction(ctx, itemId);
      if (!result.success) {
        setLocalError(result.error || 'Ошибка увеличения количества');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLocalError('Произошла ошибка при увеличении количества');
    }
  };
  
  const handleDecrease = async () => {
    if (disabled || isItemUpdating || !canDecreaseQuantity(ctx, itemId)) {
      return;
    }
    
    setLocalError('');
    
    try {
      const result = await decreaseQuantityAction(ctx, itemId);
      if (!result.success) {
        setLocalError(result.error || 'Ошибка уменьшения количества');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLocalError('Произошла ошибка при уменьшении количества');
    }
  };
  
  // Обработчик ручного ввода
  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      setShowManualInput(false);
      setManualInput('');
      return;
    }
    
    const quantity = parseInt(manualInput, 10);
    
    // Валидация
    const validation = validateQuantity(quantity, { 
      minQuantity, 
      maxQuantity,
      enableOptimisticUpdates: true,
      showNotifications: true,
      debounceMs: 0,
      enableUndo: true,
      undoTimeoutMs: 5000
    });
    
    if (!validation.isValid) {
      setLocalError(validation.error || 'Некорректное количество');
      return;
    }
    
    setLocalError('');
    
    try {
      const result = await setQuantityAction(ctx, itemId, quantity);
      if (result.success) {
        setShowManualInput(false);
        setManualInput('');
      } else {
        setLocalError(result.error || 'Ошибка установки количества');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLocalError('Произошла ошибка при установке количества');
    }
  };
  
  const handleManualCancel = () => {
    setShowManualInput(false);
    setManualInput('');
    setLocalError('');
  };
  
  const handleUndo = async () => {
    if (!canUndo) return;
    
    try {
      const result = await undoLastOperationAction(ctx);
      if (!result.success) {
        setLocalError(result.error || 'Ошибка отмены операции');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLocalError('Произошла ошибка при отмене операции');
    }
  };
  
  // Обработчик ввода в поле
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры
    if (/^\d*$/.test(value)) {
      setManualInput(value);
      setLocalError('');
    }
  };
  
  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    } else if (e.key === 'Escape') {
      handleManualCancel();
    }
  };
  
  // Если товара нет в корзине
  if (!item) {
    return null;
  }
  
  const displayError = localError || updateError;
  const canIncrease = !disabled && !isItemUpdating && canIncreaseQuantity(ctx, itemId);
  const canDecrease = !disabled && !isItemUpdating && canDecreaseQuantity(ctx, itemId);
  
  // Компактный вариант
  if (variant === 'compact') {
    return (
      <div className={`update-quantity-compact ${className}`}>
        <div className="btn-group" role="group">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            disabled={!canDecrease}
            title="Уменьшить количество"
          >
            −
          </Button>
          
          <span className="btn btn-outline-secondary btn-sm disabled">
            {isItemUpdating ? <Loader size="sm" /> : currentQuantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrease}
            disabled={!canIncrease}
            title="Увеличить количество"
          >
            +
          </Button>
        </div>
        
        {displayError && (
          <div className="text-danger small mt-1">{displayError}</div>
        )}
      </div>
    );
  }
  
  // Инлайн вариант
  if (variant === 'inline') {
    return (
      <div className={`update-quantity-inline d-flex align-items-center ${className}`}>
        <Button
          variant="link"
          size="sm"
          onClick={handleDecrease}
          disabled={!canDecrease}
          className="p-1"
        >
          −
        </Button>
        
        <span className="mx-2 fw-semibold">
          {isItemUpdating ? <Loader size="sm" /> : currentQuantity}
        </span>
        
        <Button
          variant="link"
          size="sm"
          onClick={handleIncrease}
          disabled={!canIncrease}
          className="p-1"
        >
          +
        </Button>
        
        {displayError && (
          <div className="text-danger small ms-2">{displayError}</div>
        )}
      </div>
    );
  }
  
  // Полный вариант
  return (
    <div className={`update-quantity-full ${className}`}>
      <div className="d-flex align-items-center gap-2">
        {/* Кнопки количества */}
        <div className="quantity-controls d-flex align-items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            disabled={!canDecrease}
            loading={isItemUpdating}
            title={currentQuantity <= minQuantity ? 'Удалить из корзины' : 'Уменьшить количество'}
          >
            {currentQuantity <= minQuantity ? '🗑️' : '−'}
          </Button>
          
          <div className="quantity-display mx-2 text-center" style={{ minWidth: '40px' }}>
            {showManualInput && allowManualInput ? (
              <Input
                type="text"
                value={manualInput}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyPress}
                onBlur={handleManualSubmit}
                autoFocus
                className="text-center"
                style={{ width: '60px' }}
              />
            ) : (
              <span 
                className={`fw-semibold ${allowManualInput ? 'cursor-pointer' : ''}`}
                onClick={() => allowManualInput && setShowManualInput(true)}
                title={allowManualInput ? 'Нажмите для ручного ввода' : ''}
              >
                {isItemUpdating ? <Loader size="sm" /> : currentQuantity}
              </span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrease}
            disabled={!canIncrease}
            loading={isItemUpdating}
            title="Увеличить количество"
          >
            +
          </Button>
        </div>
        
        {/* Цена */}
        {showPrice && (
          <div className="price-display ms-2">
            <span className="fw-semibold">{formatPrice(totalPrice)}</span>
          </div>
        )}
        
        {/* Кнопка отмены */}
        {showUndo && canUndo && lastOperation?.itemId === itemId && (
          <Button
            variant="link"
            size="sm"
            onClick={handleUndo}
            title="Отменить последнее действие"
            className="text-muted p-1"
          >
            ↶
          </Button>
        )}
      </div>
      
      {/* Ошибки */}
      {displayError && (
        <div className="alert alert-warning alert-sm mt-2 mb-0">
          {displayError}
        </div>
      )}
      
      {/* Информация о лимитах */}
      {(currentQuantity >= maxQuantity || currentQuantity <= minQuantity) && (
        <div className="text-muted small mt-1">
          {currentQuantity >= maxQuantity && `Максимум: ${maxQuantity}`}
          {currentQuantity <= minQuantity && `Минимум: ${minQuantity}`}
        </div>
      )}
      
      {/* Кнопки ручного ввода */}
      {showManualInput && allowManualInput && (
        <div className="manual-input-controls mt-2">
          <div className="d-flex gap-1">
            <Button size="sm" variant="primary" onClick={handleManualSubmit}>
              ✓
            </Button>
            <Button size="sm" variant="secondary" onClick={handleManualCancel}>
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Простая кнопка увеличения количества
export interface IncreaseButtonProps {
  itemId: string;
  className?: string;
  disabled?: boolean;
  showLoader?: boolean;
}

export const IncreaseButton = ({
  itemId,
  className = '',
  disabled = false,
  showLoader = true
}: IncreaseButtonProps) => {
  const [updatingItemId] = useAtom(updatingItemIdAtom);
  const isItemUpdating = updatingItemId === itemId;
  const canIncrease = canIncreaseQuantity(ctx, itemId);
  
  const handleClick = () => {
    if (!disabled && !isItemUpdating && canIncrease) {
      increaseQuantityAction(ctx, itemId);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled || !canIncrease}
      loading={showLoader && isItemUpdating}
      className={className}
      title="Увеличить количество"
    >
      +
    </Button>
  );
};

// Простая кнопка уменьшения количества
export interface DecreaseButtonProps {
  itemId: string;
  className?: string;
  disabled?: boolean;
  showLoader?: boolean;
  showDeleteIcon?: boolean;
}

export const DecreaseButton = ({
  itemId,
  className = '',
  disabled = false,
  showLoader = true,
  showDeleteIcon = true
}: DecreaseButtonProps) => {
  const [updatingItemId] = useAtom(updatingItemIdAtom);
  const isItemUpdating = updatingItemId === itemId;
  const canDecrease = canDecreaseQuantity(ctx, itemId);
  const currentQuantity = getItemQuantity(ctx, itemId);
  const limits = getQuantityLimits(ctx);
  
  const willDelete = currentQuantity <= limits.min;
  
  const handleClick = () => {
    if (!disabled && !isItemUpdating && canDecrease) {
      decreaseQuantityAction(ctx, itemId);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled || !canDecrease}
      loading={showLoader && isItemUpdating}
      className={className}
      title={willDelete ? 'Удалить из корзины' : 'Уменьшить количество'}
    >
      {willDelete && showDeleteIcon ? '🗑️' : '−'}
    </Button>
  );
};

// Дисплей количества с возможностью редактирования
export interface QuantityDisplayProps {
  itemId: string;
  className?: string;
  editable?: boolean;
  showLoader?: boolean;
}

export const QuantityDisplay = ({
  itemId,
  className = '',
  editable = false,
  showLoader = true
}: QuantityDisplayProps) => {
  const [updatingItemId] = useAtom(updatingItemIdAtom);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const isItemUpdating = updatingItemId === itemId;
  const currentQuantity = getItemQuantity(ctx, itemId);
  
  const handleStartEdit = () => {
    if (editable && !isItemUpdating) {
      setInputValue(String(currentQuantity));
      setIsEditing(true);
    }
  };
  
  const handleSubmitEdit = async () => {
    const quantity = parseInt(inputValue, 10);
    
    if (quantity !== currentQuantity && !isNaN(quantity)) {
      await setQuantityAction(ctx, itemId, quantity);
    }
    
    setIsEditing(false);
    setInputValue('');
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setInputValue('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };
  
  if (isEditing) {
    return (
      <Input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        onBlur={handleSubmitEdit}
        autoFocus
        className={`text-center ${className}`}
        style={{ width: '60px' }}
      />
    );
  }
  
  return (
    <span 
      className={`quantity-display ${editable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleStartEdit}
      title={editable ? 'Нажмите для редактирования' : ''}
    >
      {showLoader && isItemUpdating ? <Loader size="sm" /> : currentQuantity}
    </span>
  );
};