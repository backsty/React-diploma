import { useAtom } from '@reatom/npm-react';
import { setProductQuantityAction, productQuantitiesAtom } from '@/entities/product';
import { Button, Input } from '@/shared/ui';
import { ctx } from '@/shared/store';

export interface QuantitySelectorProps {
  productId: number;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  onQuantityChange?: ((quantity: number) => void) | undefined;
}

export const QuantitySelector = ({
  productId,
  className = '',
  disabled = false,
  min = 1,
  max = 10,
  onQuantityChange
}: QuantitySelectorProps) => {
  const [quantitiesMap] = useAtom(productQuantitiesAtom);
  const quantity = quantitiesMap[productId] || 1;
  
  const handleQuantityChange = (newQuantity: number) => {
    if (disabled) return;
    
    const clampedQuantity = Math.max(min, Math.min(max, newQuantity));
    setProductQuantityAction(ctx, productId, clampedQuantity);
    
    if (onQuantityChange) {
      onQuantityChange(clampedQuantity);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleQuantityChange(value);
    }
  };
  
  const handleDecrement = () => {
    handleQuantityChange(quantity - 1);
  };
  
  const handleIncrement = () => {
    handleQuantityChange(quantity + 1);
  };
  
  return (
    <div className={`quantity-selector ${className}`}>
      <label htmlFor={`quantity-${productId}`} className="form-label">
        Количество:
      </label>
      
      <div className="d-flex align-items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={quantity <= min || disabled}
          aria-label="Уменьшить количество"
        >
          −
        </Button>
        
        <Input
          type="number"
          id={`quantity-${productId}`}
          value={quantity}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={disabled}
          className="text-center"
          style={{ width: '80px' }}
          aria-label="Количество товара"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={quantity >= max || disabled}
          aria-label="Увеличить количество"
        >
          +
        </Button>
      </div>
      
      <div className="quantity-info mt-1">
        <small className="text-muted">
          Можно заказать от {min} до {max} штук
        </small>
      </div>
    </div>
  );
};