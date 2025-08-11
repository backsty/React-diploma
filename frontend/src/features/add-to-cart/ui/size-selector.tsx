import { useAtom } from '@reatom/npm-react';
import { setSelectedSizeAction, selectedSizesAtom } from '@/entities/product';
import { ctx } from '@/shared/store';
import type { ProductSize } from '@/entities/product';

export interface SizeSelectorProps {
  productId: number;
  sizes: ProductSize[];
  className?: string;
  disabled?: boolean;
  onSizeChange?: ((size: string) => void) | undefined;
}

export const SizeSelector = ({
  productId,
  sizes,
  className = '',
  disabled = false,
  onSizeChange
}: SizeSelectorProps) => {
  const [selectedSizesMap] = useAtom(selectedSizesAtom);
  const selectedSize = selectedSizesMap[productId] || null;

  const availableSizes = sizes.filter(size => size.available);
  const unavailableSizes = sizes.filter(size => !size.available);
  
  const handleSizeSelect = (size: string, available: boolean) => {
    if (disabled || !available) return;
    
    setSelectedSizeAction(ctx, productId, size);
    
    if (onSizeChange) {
      onSizeChange(size);
    }
  };
  
  if (sizes.length === 0) {
    return (
      <div className={`sizes-unavailable ${className}`}>
        <p className="text-muted">Размеры не указаны</p>
      </div>
    );
  }
  
  return (
    <div className={`size-selector ${className}`}>
      <p className="size-selector-label">
        Размеры 
        {availableSizes.length > 0 && (
          <span className="text-success">
            {` (${availableSizes.length} в наличии${unavailableSizes.length > 0 ? `, ${unavailableSizes.length} нет` : ''})`}
          </span>
        )}
        :
      </p>
      
      <div className="catalog-item-sizes">
        {/* Доступные размеры */}
        {availableSizes.map((size) => (
          <span
            key={`available-${size.size}`}
            className={`catalog-item-size ${
              selectedSize === size.size ? 'selected' : ''
            } ${disabled ? 'disabled' : ''}`}
            onClick={() => handleSizeSelect(size.size, true)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-pressed={selectedSize === size.size}
            aria-label={`Размер ${size.size} доступен`}
            title={`Размер ${size.size} - в наличии`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSizeSelect(size.size, true);
              }
            }}
          >
            {size.size}
          </span>
        ))}
        
        {unavailableSizes.map((size) => (
          <span
            key={`unavailable-${size.size}`}
            className="catalog-item-size unavailable"
            role="button"
            tabIndex={-1}
            aria-disabled="true"
            aria-label={`Размер ${size.size} недоступен`}
            title={`Размер ${size.size} - нет в наличии`}
            style={{ 
              opacity: 0.4, 
              cursor: 'not-allowed',
              textDecoration: 'line-through',
              backgroundColor: '#f8f9fa',
              color: '#6c757d'
            }}
          >
            {size.size}
          </span>
        ))}
      </div>
      
      {selectedSize && (
        <p className="size-selector-selected text-muted mt-2">
          Выбран размер: <strong>{selectedSize}</strong>
        </p>
      )}
      
      {availableSizes.length === 0 && (
        <div className="alert alert-warning mt-2" role="alert">
          <small>
            <strong>Нет доступных размеров.</strong> 
            Все размеры этого товара закончились.
          </small>
        </div>
      )}
    </div>
  );
};