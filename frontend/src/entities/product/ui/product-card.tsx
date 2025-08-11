import { Link } from 'react-router-dom';
import { formatPrice } from '@/shared/lib';
import { getProductRoute } from '@/shared/config';
import type { ProductPreview } from '../model/types';

export interface ProductCardProps {
  product: ProductPreview;
  className?: string;
  showPlaceholder?: boolean;
  onClick?: ((productId: number) => void) | undefined;
  disabled?: boolean;
}

export const ProductCard = ({ 
  product, 
  className = '',
  showPlaceholder = true,
  onClick,
  disabled = false
}: ProductCardProps) => {
  const productUrl = getProductRoute(product.id);
  const imageUrl = product.images[0] || (showPlaceholder ? '/images/placeholder.jpg' : '');

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      e.preventDefault();
      onClick(product.id);
    }
  };

  return (
    <div className={`card catalog-item-card ${disabled ? 'disabled' : ''} ${className}`}>
      {imageUrl && (
        <img 
          src={imageUrl}
          className="card-img-top img-fluid"
          alt={product.title}
          loading="lazy"
          style={{ 
            height: '250px', 
            objectFit: 'contain',
            opacity: disabled ? 0.5 : 1
          }}
        />
      )}
      
      <div className="card-body">
        <p className="card-text" title={product.title}>
          {product.title}
        </p>
        
        <p className="card-text">
          <span className="catalog-item-price">
            {formatPrice(product.price)}
          </span>
        </p>
        
        <div className="card-footer-actions">
          <Link 
            to={productUrl} 
            className={`btn btn-outline-primary btn-card ${disabled ? 'disabled' : ''}`}
            onClick={handleClick}
            tabIndex={disabled ? -1 : 0}
            aria-label={`Посмотреть детали товара ${product.title}`}
            aria-disabled={disabled}
          >
            Заказать
          </Link>
        </div>
      </div>
    </div>
  );
};

export interface ProductCardListProps {
  products: ProductPreview[];
  className?: string;
  onProductClick?: ((productId: number) => void) | undefined;
  columns?: 2 | 3 | 4;
}

export const ProductCardList = ({
  products,
  className = '',
  onProductClick,
  columns = 3
}: ProductCardListProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        <p>Товары не найдены</p>
      </div>
    );
  }

  const columnClass = `col-${12 / columns}`;

  return (
    <div className={`row ${className}`}>
      {products.map((product) => (
        <div key={product.id} className={columnClass}>
          <ProductCard
            product={product}
            onClick={onProductClick}
            className="mb-4"
          />
        </div>
      ))}
    </div>
  );
};

export const ProductCardSkeleton = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`card catalog-item-card ${className}`}>
      <div 
        className="card-img-top bg-light"
        style={{ height: '250px' }}
        aria-label="Загрузка изображения товара"
      />
      
      <div className="card-body">
        <div className="bg-light rounded" style={{ height: '20px', marginBottom: '8px' }} />
        <div className="bg-light rounded" style={{ height: '24px', marginBottom: '16px', width: '60%' }} />
        
        <div className="card-footer-actions">
          <div className="bg-light rounded" style={{ height: '38px' }} />
        </div>
      </div>
    </div>
  );
};

export const ProductCardListSkeleton = ({ 
  count = 6, 
  columns = 3,
  className = '' 
}: { 
  count?: number; 
  columns?: 2 | 3 | 4;
  className?: string;
}) => {
  const columnClass = `col-${12 / columns}`;

  return (
    <div className={`row ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={columnClass}>
          <ProductCardSkeleton className="mb-4" />
        </div>
      ))}
    </div>
  );
};