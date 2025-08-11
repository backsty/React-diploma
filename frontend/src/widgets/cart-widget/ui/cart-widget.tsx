import { useAtom } from '@reatom/npm-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { cartCountAtom } from '@/shared/store';

export interface CartWidgetProps {
  className?: string;
}

export const CartWidget = ({ className = '' }: CartWidgetProps) => {
  const [itemsCount] = useAtom(cartCountAtom);
  const hasItems = itemsCount > 0;

  return (
    <div className={`position-relative ${className}`}>
      <Link 
        to={ROUTES.CART}
        className="header-controls-pic header-controls-cart"
        title="Корзина"
        aria-label={`Корзина (товаров: ${itemsCount})`}
      >
        {hasItems && (
          <div className="header-controls-cart-full">
            {itemsCount}
          </div>
        )}
      </Link>
    </div>
  );
};