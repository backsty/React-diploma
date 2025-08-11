import { useAtom } from '@reatom/npm-react';
import { ErrorMessage, Loader } from '@/shared/ui';
import {
  categoriesSelector,
  selectCategoryAction,
  selectedCategoryIdAtom
} from '../model/categories';
import { ctx } from '@/shared/store';
import type { Category } from '@/shared/lib/api';

export interface CategoryFilterProps {
  className?: string;
  onCategoryChange?: ((categoryId: number | null) => void) | undefined;
  disabled?: boolean;
}

export const CategoryFilter = ({
  className = '',
  onCategoryChange,
  disabled = false
}: CategoryFilterProps) => {
  const [categoriesState] = useAtom(categoriesSelector);
  const [selectedCategoryId] = useAtom(selectedCategoryIdAtom);

  const handleCategoryClick = (category: Category) => {
    if (disabled || categoriesState.loading) return;

    const categoryId = category.id === 0 ? null : category.id;
    
    selectCategoryAction(ctx, categoryId);
    
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  if (categoriesState.loading) {
    return (
      <div className={`category-filter loading ${className}`}>
        <Loader size="sm" />
        <span className="ms-2">Загрузка категорий...</span>
      </div>
    );
  }

  if (categoriesState.error) {
    return (
      <div className={`category-filter error ${className}`}>
        <ErrorMessage 
          message={categoriesState.error}
          variant="inline"
        />
      </div>
    );
  }

  if (categoriesState.items.length === 0) {
    return null;
  }

  return (
    <ul className={`catalog-categories nav justify-content-center ${className}`}>
      {categoriesState.items.map((category) => {
        const isActive = selectedCategoryId === (category.id === 0 ? null : category.id);
        
        return (
          <li key={category.id} className="nav-item">
            <button
              className={`nav-link ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleCategoryClick(category)}
              disabled={disabled}
              type="button"
              aria-pressed={isActive}
              aria-label={`Фильтр по категории: ${category.title}`}
            >
              {category.title}
            </button>
          </li>
        );
      })}
    </ul>
  );
};