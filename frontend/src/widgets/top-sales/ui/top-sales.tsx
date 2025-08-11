import { useEffect } from 'react';
import { useAtom } from '@reatom/npm-react';
import { ProductCard } from '@/entities/product';
import { Loader, ErrorMessage } from '@/shared/ui';
import {
  topSalesSelector,
  loadTopSalesAction,
  hasTopSalesAtom
} from '../model/top-sales';
import { ctx } from '@/shared/store';

export interface TopSalesProps {
  className?: string;
  onProductClick?: ((productId: number) => void) | undefined;
}

export const TopSales = ({ 
  className = '',
  onProductClick 
}: TopSalesProps) => {
  const [topSalesState] = useAtom(topSalesSelector);
  const [hasTopSales] = useAtom(hasTopSalesAtom);

  // Загружаем хиты продаж при монтировании компонента
  useEffect(() => {
    loadTopSalesAction(ctx);
  }, []);

  const handleProductClick = (productId: number) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };

  // Если хитов продаж нет и компонент не загружается, не отображаем ничего
  if (!topSalesState.loading && !topSalesState.error && !hasTopSales) {
    return null;
  }

  return (
    <section className={`top-sales ${className}`}>
      <h2 className="text-center">Хиты продаж!</h2>
      
      {/* Состояние загрузки */}
      {topSalesState.loading && (
        <div className="top-sales-loading text-center py-4">
          <Loader size="lg" />
        </div>
      )}
      
      {/* Ошибка загрузки */}
      {topSalesState.error && !hasTopSales && (
        <div className="top-sales-error">
          <ErrorMessage 
            message={topSalesState.error}
            onRetry={() => loadTopSalesAction(ctx)}
          />
        </div>
      )}
      
      {/* Список хитов продаж */}
      {hasTopSales && (
        <div className="row">
          {topSalesState.items.map((item) => (
            <div key={item.id} className="col-4">
              <ProductCard 
                product={item}
                onClick={() => handleProductClick(item.id)}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Ошибка загрузки при наличии данных */}
      {topSalesState.error && hasTopSales && (
        <div className="top-sales-error-partial mt-3">
          <ErrorMessage 
            message="Не удалось обновить хиты продаж"
            variant="inline"
          />
        </div>
      )}
    </section>
  );
};