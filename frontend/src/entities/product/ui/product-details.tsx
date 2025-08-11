import { useState, useEffect } from 'react';
import { useAtom } from '@reatom/npm-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { ROUTES } from '@/shared/config';
import { formatPrice } from '@/shared/lib';
import { 
  setSelectedSizeAction, 
  setProductQuantityAction,
  selectedSizesAtom,
  productQuantitiesAtom,
  hasAvailableSizes
} from '../model/product';
import { ctx, addToCartAction } from '@/shared/store';
import type { Product } from '../model/types';

export interface ProductDetailsProps {
  product: Product;
  className?: string;
  onAddToCart?: (() => void) | undefined;
  disabled?: boolean;
}

/**
 * Детальная информация о товаре с возможностью добавления в корзину
 */
export const ProductDetails = ({ 
  product, 
  className = '',
  onAddToCart,
  disabled = false
}: ProductDetailsProps) => {
  const navigate = useNavigate();
  const [selectedSizesMap] = useAtom(selectedSizesAtom);
  const [quantitiesMap] = useAtom(productQuantitiesAtom);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const selectedSize = selectedSizesMap[product.id] || null;
  const quantity = quantitiesMap[product.id] || 1;
  const hasAvailableSizesFlag = hasAvailableSizes(product);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [success]);

  const handleSizeSelect = (size: string) => {
    if (disabled) return;
    setSelectedSizeAction(ctx, product.id, size);
    setError('');
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (disabled) return;
    const clampedQuantity = Math.max(1, Math.min(10, newQuantity));
    setProductQuantityAction(ctx, product.id, clampedQuantity);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setError('Выберите размер товара');
      return;
    }

    if (disabled || isAdding) return;

    setIsAdding(true);
    setError('');

    try {
      const cartData = {
        productId: product.id,
        title: product.title,
        size: selectedSize,
        price: product.price,
        count: quantity,
        ...(product.images[0] && { image: product.images[0] })
      };

      await addToCartAction(ctx, cartData);

      setSuccess(true);
      
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (err) {
      setError('Ошибка добавления товара в корзину');
      console.error('Ошибка добавления в корзину:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleGoToCart = () => {
    navigate(ROUTES.CART);
  };

  if (!product) {
    return <div className="alert alert-warning">Товар не найден</div>;
  }

  return (
    <div className={`product-details ${className}`}>
      <div className="row">
        <div className="col-md-6">
          {product.images && product.images.length > 0 && (
            <img 
              src={product.images[0]} 
              className="img-fluid" 
              alt={product.title}
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
          )}
        </div>
        
        <div className="col-md-6">
          <h1>{product.title}</h1>
          
          <table className="table table-bordered">
            <tbody>
              <tr>
                <td>Артикул</td>
                <td>{product.sku}</td>
              </tr>
              <tr>
                <td>Производитель</td>
                <td>{product.manufacturer}</td>
              </tr>
              <tr>
                <td>Цвет</td>
                <td>{product.color}</td>
              </tr>
              <tr>
                <td>Материалы</td>
                <td>{product.material}</td>
              </tr>
              <tr>
                <td>Сезон</td>
                <td>{product.season}</td>
              </tr>
              <tr>
                <td>Повод</td>
                <td>{product.reason}</td>
              </tr>
            </tbody>
          </table>

          {hasAvailableSizesFlag && (
            <>
              <div className="text-center">
                <p>
                  Размеры товара 
                  <span className="text-muted small">
                    ({product.sizes.filter(s => s.available).length} из {product.sizes.length} доступно)
                  </span>
                  :
                </p>
                <div className="catalog-item-sizes">
                  {product.sizes
                    .filter(size => size.available)
                    .map(size => (
                      <span
                        key={`available-${size.size}`}
                        className={`catalog-item-size ${
                          selectedSize === size.size ? 'selected' : ''
                        } ${disabled ? 'disabled' : ''}`}
                        onClick={() => handleSizeSelect(size.size)}
                        role="button"
                        tabIndex={disabled ? -1 : 0}
                        aria-pressed={selectedSize === size.size}
                        aria-label={`Размер ${size.size}`}
                        title={`Размер ${size.size} - в наличии`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSizeSelect(size.size);
                          }
                        }}
                      >
                        {size.size}
                      </span>
                    ))
                  }
                  
                  {product.sizes
                    .filter(size => !size.available)
                    .map(size => (
                      <span
                        key={`unavailable-${size.size}`}
                        className="catalog-item-size"
                        tabIndex={-1}
                        aria-disabled="true"
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
                    ))
                  }
                </div>
                
                {product.sizes.some(s => !s.available) && (
                  <div className="mt-2">
                    <small className="text-muted">
                      <em>Зачеркнутые размеры временно недоступны</em>
                    </small>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-3">
                <p>Количество:</p>
                <div className="d-flex justify-content-center align-items-center">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || disabled}
                  >
                    -
                  </button>
                  <span className="mx-3 fs-5">{quantity}</span>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10 || disabled}
                  >
                    +
                  </button>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success mt-3" role="alert">
                  ✅ Товар добавлен в корзину!
                </div>
              )}

              <div className="text-center mt-4">
                <div className="mb-3">
                  <h3>{formatPrice(product.price * quantity)}</h3>
                </div>
                
                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={disabled || isAdding || !selectedSize}
                    loading={isAdding}
                    className="px-4"
                  >
                    {isAdding ? 'Добавляем...' : 'В корзину'}
                  </Button>
                  
                  {success && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleGoToCart}
                      className="px-4"
                    >
                      Перейти в корзину
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {!hasAvailableSizesFlag && (
            <div className="text-center">
              <div className="alert alert-warning">
                <h5>Товар временно недоступен</h5>
                <p>Все размеры данного товара закончились</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductDetailsSkeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`product-details-skeleton ${className}`}>
      <div className="row">
        <div className="col-md-6">
          <div className="placeholder" style={{ height: '400px', backgroundColor: '#f8f9fa' }}></div>
        </div>
        <div className="col-md-6">
          <div className="placeholder mb-3" style={{ height: '40px', backgroundColor: '#f8f9fa' }}></div>
          <div className="placeholder mb-2" style={{ height: '200px', backgroundColor: '#f8f9fa' }}></div>
          <div className="placeholder mb-2" style={{ height: '50px', backgroundColor: '#f8f9fa' }}></div>
          <div className="placeholder" style={{ height: '60px', backgroundColor: '#f8f9fa' }}></div>
        </div>
      </div>
    </div>
  );
};