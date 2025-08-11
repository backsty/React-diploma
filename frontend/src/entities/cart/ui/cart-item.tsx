import { formatPrice } from '@/shared/lib';
import { updateCartItemAction, removeFromCartAction } from '../model/cart';
import { ctx } from '@/shared/store';
import type { CartItem } from '../model/types';

export interface CartItemProps {
  item: CartItem;
  className?: string;
}

export const CartItemComponent = ({ item, className = '' }: CartItemProps) => {
  const handleUpdateQuantity = (newCount: number) => {
    if (newCount <= 0) {
      handleRemove();
      return;
    }
    
    updateCartItemAction(ctx, {
      productId: item.id,
      size: item.size,
      newCount: Math.max(1, Math.min(10, newCount))
    });
  };

  const handleRemove = () => {
    removeFromCartAction(ctx, item.id, item.size);
  };

  const handleDecrease = () => {
    handleUpdateQuantity(item.count - 1);
  };

  const handleIncrease = () => {
    handleUpdateQuantity(item.count + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value, 10);
    if (!isNaN(newCount)) {
      handleUpdateQuantity(newCount);
    }
  };

  const totalPrice = item.price * item.count;
  const imageUrl = item.image || '/images/placeholder.jpg';

  return (
    <tr className={className}>
      {/* Изображение */}
      <td>
        <img 
          src={imageUrl}
          alt={item.title}
          className="img-fluid"
          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
      </td>
      
      {/* Название */}
      <td>{item.title}</td>
      
      {/* Размер */}
      <td>{item.size}</td>
      
      {/* Количество */}
      <td>
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDecrease}
            disabled={item.count <= 1}
            aria-label="Уменьшить количество"
          >
            −
          </button>
          
          <input 
            type="number" 
            className="form-control form-control-sm mx-1 text-center"
            style={{ width: '60px' }}
            value={item.count}
            min="1"
            max="10"
            onChange={handleInputChange}
            aria-label="Количество товара"
          />
          
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={handleIncrease}
            disabled={item.count >= 10}
            aria-label="Увеличить количество"
          >
            +
          </button>
        </div>
      </td>
      
      {/* Цена за единицу */}
      <td>{formatPrice(item.price)}</td>
      
      {/* Общая стоимость */}
      <td>{formatPrice(totalPrice)}</td>
      
      {/* Действия */}
      <td>
        <button 
          className="btn btn-outline-danger btn-sm"
          onClick={handleRemove}
          title="Удалить товар"
          aria-label="Удалить товар из корзины"
        >
          ×
        </button>
      </td>
    </tr>
  );
};