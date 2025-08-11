import { useEffect, useCallback, useRef } from 'react';
import { useAtom } from '@reatom/npm-react';
import { useSearchParams } from 'react-router-dom';
import { Loader, ErrorMessage } from '@/shared/ui';
import { ProductCard } from '@/entities/product';
import { CategoryFilter } from './category-filter';
import { LoadMoreButton } from './load-more-button';
import { SearchInput } from './search-input';
import {
  catalogSelector,
  loadCatalogAction,
  loadMoreCatalogAction,
  resetCatalogAction,
  setSearchQueryAction
} from '../model/catalog';
import {
  categoriesSelector,
  loadCategoriesAction,
  selectedCategoryIdAtom
} from '../model/categories';
import { 
  setSearchAction 
} from '@/widgets/header';
import { ctx } from '@/shared/store';

export interface ProductCatalogProps {
  className?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  onProductClick?: ((productId: number) => void) | undefined;
}

export const ProductCatalog = ({
  className = '',
  showSearch = true,
  showCategories = true,
  onProductClick
}: ProductCatalogProps) => {
  const [searchParams] = useSearchParams();
  const [catalogState] = useAtom(catalogSelector);
  const [categoriesState] = useAtom(categoriesSelector);
  const [selectedCategoryId] = useAtom(selectedCategoryIdAtom);

  const lastSearchRef = useRef<string>('');
  const lastCategoryRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const currentSearchParamsRef = useRef<string>('');

  const handleCategoryChange = useCallback(async (categoryId: number | null) => {
    lastCategoryRef.current = categoryId;
    
    await loadCatalogAction(ctx, {
      categoryId,
      searchQuery: catalogState.searchQuery,
      reset: true
    });
  }, [catalogState.searchQuery]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery === lastSearchRef.current) {
      return;
    }
    
    lastSearchRef.current = trimmedQuery;
    
    // Синхронизируем с header search только при отправке формы
    setSearchAction(ctx, trimmedQuery);
    setSearchQueryAction(ctx, trimmedQuery);
    
    await loadCatalogAction(ctx, {
      categoryId: selectedCategoryId,
      searchQuery: trimmedQuery,
      reset: true
    });
  }, [selectedCategoryId]);

  const handleLoadMore = useCallback(async () => {
    await loadMoreCatalogAction(ctx, {
      categoryId: selectedCategoryId,
      searchQuery: catalogState.searchQuery
    });
  }, [selectedCategoryId, catalogState.searchQuery]);

  const handleProductCardClick = useCallback((productId: number) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  }, [onProductClick]);

  useEffect(() => {
    const initializeData = async () => {
      if (isInitializedRef.current) return;
      
      // Сбрасываем состояние
      resetCatalogAction(ctx);
      
      // Загружаем категории
      if (showCategories && categoriesState.items.length === 0) {
        await loadCategoriesAction(ctx);
      }
      
      // Получаем поисковый запрос из URL
      const queryFromUrl = searchParams.get('q') || '';
      const searchParamsString = searchParams.toString();
      
      currentSearchParamsRef.current = searchParamsString;
      
      if (queryFromUrl) {
        lastSearchRef.current = queryFromUrl;
        setSearchQueryAction(ctx, queryFromUrl);
        setSearchAction(ctx, queryFromUrl);
      }
      
      lastCategoryRef.current = selectedCategoryId;
      
      // Загружаем каталог
      await loadCatalogAction(ctx, {
        categoryId: selectedCategoryId,
        searchQuery: queryFromUrl,
        reset: true
      });
      
      isInitializedRef.current = true;
    };

    initializeData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив - инициализация только один раз

  // Отдельный эффект только для изменения URL
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    const searchParamsString = searchParams.toString();
    
    // Проверяем, изменились ли параметры URL
    if (searchParamsString !== currentSearchParamsRef.current) {
      currentSearchParamsRef.current = searchParamsString;
      
      const queryFromUrl = searchParams.get('q') || '';
      
      if (queryFromUrl !== lastSearchRef.current) {
        lastSearchRef.current = queryFromUrl;
        
        setSearchQueryAction(ctx, queryFromUrl);
        setSearchAction(ctx, queryFromUrl);
        
        loadCatalogAction(ctx, {
          categoryId: selectedCategoryId,
          searchQuery: queryFromUrl,
          reset: true
        });
      }
    }
  }, [searchParams, selectedCategoryId]);

  const hasItems = catalogState.items.length > 0;
  const isEmpty = !catalogState.loading && !catalogState.error && !hasItems;

  return (
    <section className={`product-catalog ${className}`}>
      {/* Поиск */}
      {showSearch && (
        <div className="catalog-search mb-4">
          <SearchInput
            onSearch={handleSearch}
            disabled={catalogState.loading}
            placeholder="Поиск товаров"
            initialValue={catalogState.searchQuery}
          />
        </div>
      )}

      {/* Фильтр по категориям */}
      {showCategories && (
        <div className="catalog-categories mb-4">
          <CategoryFilter
            onCategoryChange={handleCategoryChange}
            disabled={catalogState.loading}
          />
        </div>
      )}

      {/* Состояние загрузки */}
      {catalogState.loading && !hasItems && (
        <div className="catalog-loading text-center py-5">
          <Loader size="lg" />
          <div className="mt-3">Загрузка товаров...</div>
        </div>
      )}

      {/* Ошибка загрузки */}
      {catalogState.error && !hasItems && (
        <div className="catalog-error">
          <ErrorMessage 
            message={catalogState.error}
            onRetry={() => loadCatalogAction(ctx, {
              categoryId: selectedCategoryId,
              searchQuery: catalogState.searchQuery,
              reset: true
            })}
          />
        </div>
      )}

      {/* Пустое состояние */}
      {isEmpty && (
        <div className="catalog-empty text-center py-5">
          <div className="empty-state-icon">
            <div className="search-empty-icon">🔍</div>
          </div>
          <h3>Товары не найдены</h3>
          <p className="text-muted">
            {catalogState.searchQuery 
              ? `По запросу "${catalogState.searchQuery}" ничего не найдено` 
              : 'В этой категории пока нет товаров'
            }
          </p>
        </div>
      )}

      {/* Список товаров */}
      {hasItems && (
        <>
          <div className="row">
            {catalogState.items.map((product) => (
              <div key={product.id} className="col-4">
                <ProductCard 
                  product={product}
                  onClick={() => handleProductCardClick(product.id)}
                />
              </div>
            ))}
          </div>

          {/* Кнопка "Загрузить ещё" */}
          {catalogState.hasMore && (
            <div className="catalog-load-more mt-4 text-center">
              <LoadMoreButton
                onLoadMore={handleLoadMore}
                disabled={catalogState.loading}
              />
            </div>
          )}
        </>
      )}

      {/* Ошибка загрузки дополнительных товаров */}
      {catalogState.error && hasItems && (
        <div className="catalog-load-more-error mt-3">
          <ErrorMessage 
            message={catalogState.error}
            variant="inline"
          />
        </div>
      )}
    </section>
  );
};