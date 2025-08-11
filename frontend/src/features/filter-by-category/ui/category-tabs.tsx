import { useEffect, useState, useCallback } from 'react';
import { useAtom } from '@reatom/npm-react';
import { useSearchParams } from 'react-router-dom';
import { Button, Loader, ErrorMessage, EmptyState } from '@/shared/ui';
import { 
  getCategories,
  categoriesListAtom,
  setCategoriesLoadingAction,
  setCategoriesDataAction,
  setCategoriesErrorAction,
  ALL_CATEGORIES_ID
} from '@/entities/category';
import {
  categoryFilterSelector,
  selectedCategoryIdAtom,
  categoryFilterLoadingAtom,
  categoryFilterErrorAtom,
  canLoadMoreAtom,
  categoryFilterStatsAtom,
  filteredProductsAtom,
  setSelectedCategoryAction,
  filterProductsByCategoryAction,
  loadMoreProductsAction,
  resetCategoryFilterAction,
  getCategoryFilterText,
  validateCategoryFilter
} from '../model/category-filter';
import { ctx } from '@/shared/store';
import type { Category } from '@/entities/category';
import type { Product } from '@/entities/product';

export interface CategoryTabsProps {
  className?: string;
  onCategoryChange?: ((categoryId: number, category: Category | null) => void) | undefined;
  onProductsFiltered?: ((products: Product[], categoryId: number) => void) | undefined;
  searchQuery?: string;
  showLoadMore?: boolean;
  showStats?: boolean;
}

export const CategoryTabs = ({
  className = '',
  onCategoryChange,
  onProductsFiltered,
  searchQuery = '',
  showLoadMore = true,
  showStats = true
}: CategoryTabsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoriesState] = useAtom(categoriesListAtom);
  const [selectedCategoryId] = useAtom(selectedCategoryIdAtom);
  const [isFilterLoading] = useAtom(categoryFilterLoadingAtom);
  const [filterError] = useAtom(categoryFilterErrorAtom);
  const [canLoadMore] = useAtom(canLoadMoreAtom);
  const [filterStats] = useAtom(categoryFilterStatsAtom);
  const [filteredProducts] = useAtom(filteredProductsAtom);
  const [_filterState] = useAtom(categoryFilterSelector);
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Стабильная функция для выбора категории с useCallback
  const handleCategorySelect = useCallback(async (categoryId: number, keepUrl: boolean = false) => {
    const validation = validateCategoryFilter(categoryId);
    if (!validation.isValid) {
      return;
    }
    
    // Обновляем URL если нужно
    if (!keepUrl) {
      const newSearchParams = new URLSearchParams(searchParams);
      if (categoryId === ALL_CATEGORIES_ID) {
        newSearchParams.delete('categoryId');
      } else {
        newSearchParams.set('categoryId', String(categoryId));
      }
      setSearchParams(newSearchParams);
    }
    
    // Выполняем фильтрацию
    const result = await filterProductsByCategoryAction(ctx, {
      categoryId,
      searchQuery: searchQuery || undefined,
      resetResults: true
    });
    
    if (result.success) {
      // Находим объект категории
      const category = categoriesState.items.find(cat => cat.id === categoryId) || null;
      
      // Вызываем callback'и
      if (onCategoryChange) {
        onCategoryChange(categoryId, category);
      }
      
      if (onProductsFiltered && result.products) {
        onProductsFiltered(result.products, categoryId);
      }
    }
  }, [searchParams, setSearchParams, searchQuery, categoriesState.items, onCategoryChange, onProductsFiltered]);
  
  // Инициализация категорий при монтировании
  useEffect(() => {
    const initializeCategories = async () => {
      if (categoriesState.items.length === 0 && !categoriesState.isLoading) {
        try {
          setCategoriesLoadingAction(ctx, true);
          const categories = await getCategories();
          setCategoriesDataAction(ctx, categories);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки категорий';
          setCategoriesErrorAction(ctx, errorMessage);
        }
      }
      setIsInitialized(true);
    };
    
    initializeCategories();
  }, [categoriesState.items.length, categoriesState.isLoading]);
  
  // Инициализация из URL параметров
  useEffect(() => {
    if (!isInitialized || categoriesState.items.length === 0) return;
    
    const categoryIdFromUrl = searchParams.get('categoryId');
    if (categoryIdFromUrl) {
      const categoryId = parseInt(categoryIdFromUrl, 10);
      const validation = validateCategoryFilter(categoryId);
      
      if (validation.isValid && categoryId !== selectedCategoryId) {
        handleCategorySelect(categoryId);
      }
    } else if (selectedCategoryId === ALL_CATEGORIES_ID) {
      // Загружаем товары для категории "Все" по умолчанию
      handleCategorySelect(ALL_CATEGORIES_ID);
    }
  }, [isInitialized, categoriesState.items, searchParams, selectedCategoryId, handleCategorySelect]);
  
  // Перефильтрация при изменении поискового запроса
  useEffect(() => {
    if (isInitialized && selectedCategoryId !== null) {
      handleCategorySelect(selectedCategoryId, true);
    }
  }, [searchQuery, isInitialized, selectedCategoryId, handleCategorySelect]);
  
  const handleLoadMore = async () => {
    if (!canLoadMore) return;
    
    const result = await loadMoreProductsAction(ctx, searchQuery || undefined);
    
    if (result.success && onProductsFiltered && result.products) {
      onProductsFiltered([...filteredProducts, ...result.products], selectedCategoryId);
    }
  };
  
  const handleReset = () => {
    resetCategoryFilterAction(ctx);
    setSearchParams({});
  };
  
  // Обработка состояний загрузки категорий
  if (categoriesState.isLoading) {
    return (
      <div className={`category-tabs-loading ${className}`}>
        <Loader text="Загрузка категорий..." />
      </div>
    );
  }
  
  if (categoriesState.error) {
    return (
      <div className={`category-tabs-error ${className}`}>
        <ErrorMessage 
          message={categoriesState.error} 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }
  
  if (categoriesState.items.length === 0) {
    return (
      <div className={`category-tabs-empty ${className}`}>
        <EmptyState
          title="Категории не найдены"
          description="Не удалось загрузить список категорий"
          action={{
            label: 'Обновить страницу',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }
  
  return (
    <div className={`category-tabs ${className}`}>
      {/* Табы категорий */}
      <ul className="nav nav-tabs catalog-categories nav-fill" role="tablist">
        {categoriesState.items.map((category) => (
          <li key={category.id} className="nav-item">
            <button
              className={`nav-link ${selectedCategoryId === category.id ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={selectedCategoryId === category.id}
              onClick={() => handleCategorySelect(category.id)}
              disabled={isFilterLoading}
              title={category.title}
            >
              {category.title}
              
              {/* Индикатор загрузки для активной категории */}
              {isFilterLoading && selectedCategoryId === category.id && (
                <span className="ms-1">
                  <Loader size="sm" />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      
      {/* Контент вкладок */}
      <div className="tab-content mt-3">
        {/* Статистика фильтрации */}
        {showStats && (
          <div className="category-filter-stats mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {getCategoryFilterText(
                  selectedCategoryId, 
                  categoriesState.items
                )}
                {filterStats.hasResults && (
                  <span> — {filterStats.loadedCount} товаров</span>
                )}
              </small>
              
              {selectedCategoryId !== ALL_CATEGORIES_ID && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleReset}
                  className="p-0"
                >
                  Сбросить фильтр
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Ошибка фильтрации */}
        {filterError && (
          <div className="mb-3">
            <ErrorMessage 
              message={filterError}
              onRetry={() => handleCategorySelect(selectedCategoryId)}
            />
          </div>
        )}
        
        {/* Индикатор загрузки */}
        {isFilterLoading && filteredProducts.length === 0 && (
          <div className="text-center py-4">
            <Loader text="Загрузка товаров..." />
          </div>
        )}
        
        {/* Пустой результат */}
        {!isFilterLoading && filterStats.isEmpty && !filterError && (
          <EmptyState
            icon="📦"
            title="Товары не найдены"
            description={`В категории "${getCategoryFilterText(selectedCategoryId, categoriesState.items)}" нет товаров`}
            action={{
              label: 'Показать все товары',
              onClick: () => handleCategorySelect(ALL_CATEGORIES_ID)
            }}
          />
        )}
        
        {/* Кнопка "Загрузить ещё" */}
        {showLoadMore && canLoadMore && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isFilterLoading}
              loading={isFilterLoading && filteredProducts.length > 0}
            >
              Загрузить ещё
            </Button>
          </div>
        )}
        
        {/* Индикатор окончания списка */}
        {!filterStats.hasMore && filterStats.hasResults && (
          <div className="text-center text-muted mt-3">
            <small>Все товары загружены</small>
          </div>
        )}
      </div>
    </div>
  );
};

// Упрощенный компонент табов без дополнительного функционала
export interface SimpleCategoryTabsProps {
  className?: string;
  onCategoryChange?: ((categoryId: number) => void) | undefined;
  disabled?: boolean;
}

export const SimpleCategoryTabs = ({
  className = '',
  onCategoryChange,
  disabled = false
}: SimpleCategoryTabsProps) => {
  const [categoriesState] = useAtom(categoriesListAtom);
  const [selectedCategoryId] = useAtom(selectedCategoryIdAtom);
  
  const handleCategoryClick = (categoryId: number) => {
    if (disabled) return;
    
    setSelectedCategoryAction(ctx, categoryId);
    
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };
  
  if (categoriesState.items.length === 0) {
    return null;
  }
  
  return (
    <ul className={`nav nav-tabs ${className}`} role="tablist">
      {categoriesState.items.map((category) => (
        <li key={category.id} className="nav-item">
          <button
            className={`nav-link ${selectedCategoryId === category.id ? 'active' : ''}`}
            type="button"
            onClick={() => handleCategoryClick(category.id)}
            disabled={disabled}
          >
            {category.title}
          </button>
        </li>
      ))}
    </ul>
  );
};

// Компонент-обертка для интеграции с поиском
export interface CategoryTabsWithSearchProps extends CategoryTabsProps {
  searchQuery: string;
  _onSearchChange?: ((query: string) => void) | undefined;
}

export const CategoryTabsWithSearch = ({
  searchQuery,
  _onSearchChange, // Явно помечаем как неиспользуемый
  ...props
}: CategoryTabsWithSearchProps) => {
  // При изменении категории очищаем поиск если нужно
  const handleCategoryChange = (categoryId: number, category: Category | null) => {
    if (props.onCategoryChange) {
      props.onCategoryChange(categoryId, category);
    }
    
    // Можно добавить логику очистки поиска при смене категории
    // if (_onSearchChange && searchQuery) {
    //   _onSearchChange('');
    // }
  };
  
  return (
    <CategoryTabs
      {...props}
      searchQuery={searchQuery}
      onCategoryChange={handleCategoryChange}
    />
  );
};