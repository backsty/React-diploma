import { Link } from 'react-router-dom';
import { EmptyState, Button } from '@/shared/ui';
import { ROUTES } from '@/shared/config';

export interface CartEmptyProps {
  className?: string;
}

export const CartEmpty = ({ className = '' }: CartEmptyProps) => {
  const handleGoToCatalog = () => {
    // Дополнительная логика при переходе в каталог
  };

  return (
    <div className={className}>
      <EmptyState
        icon="🛒"
        title="Корзина пуста"
        description="Добавьте товары в корзину, чтобы оформить заказ"
        action={{
          label: 'Перейти в каталог',
          onClick: handleGoToCatalog
        }}
      />
      <div className="text-center mt-3">
        <Link to={ROUTES.CATALOG}>
          <Button variant="primary">
            Перейти в каталог
          </Button>
        </Link>
      </div>
    </div>
  );
};