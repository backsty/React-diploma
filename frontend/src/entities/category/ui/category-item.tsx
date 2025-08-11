import { useAtom } from '@reatom/npm-react';
import { setSelectedCategoryAction, selectedCategoryIdAtom } from '../model/category';
import { ctx } from '@/shared/store';
import type { Category } from '../model/types';

export interface CategoryItemProps {
  /** Данные категории */
  category: Category;
  /** Дополнительный CSS класс */
  className?: string;
  /** Внешний обработчик клика (для переопределения поведения) */
  onClick?: ((categoryId: number) => void) | undefined;
  /** Отключить категорию */
  disabled?: boolean;
  /** Показать количество товаров */
  showCount?: boolean;
  /** Количество товаров в категории */
  count?: number | undefined;
}

/**
 * Компонент элемента категории для навигации
 * Используется в каталоге и фильтрах
 */
export const CategoryItem = ({ 
  category, 
  className = '',
  onClick,
  disabled = false,
  showCount = false,
  count
}: CategoryItemProps) => {
  const [selectedCategoryId] = useAtom(selectedCategoryIdAtom);
  const isActive = selectedCategoryId === category.id;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (disabled) {
      return;
    }
    
    // Если передан внешний обработчик, используем его
    if (onClick) {
      onClick(category.id);
    } else {
      // Иначе используем стандартный action для смены категории
      setSelectedCategoryAction(ctx, category.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      if (disabled) {
        return;
      }
      
      if (onClick) {
        onClick(category.id);
      } else {
        setSelectedCategoryAction(ctx, category.id);
      }
    }
  };

  return (
    <li className={`nav-item ${className}`}>
      <a 
        className={`nav-link ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        href="#"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${category.title}${showCount && count !== undefined ? ` (${count} товаров)` : ''}`}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={disabled}
      >
        {category.title}
        
        {/* Опциональный счетчик товаров */}
        {showCount && count !== undefined && (
          <span className="badge badge-secondary ml-2" aria-hidden="true">
            {count}
          </span>
        )}
      </a>
    </li>
  );
};

/**
 * Компонент списка категорий
 * Обертка для множественных CategoryItem
 */
export interface CategoryListProps {
  /** Список категорий */
  categories: Category[];
  /** Дополнительный CSS класс */
  className?: string;
  /** Внешний обработчик клика */
  onCategorySelect?: ((categoryId: number) => void) | undefined;
  /** Показать счетчики товаров */
  showCounts?: boolean;
  /** Мапа количества товаров по категориям */
  countsMap?: Record<number, number> | undefined;
}

export const CategoryList = ({
  categories,
  className = '',
  onCategorySelect,
  showCounts = false,
  countsMap = {}
}: CategoryListProps) => {
  if (categories.length === 0) {
    return (
      <div className="text-center text-muted py-3">
        <p>Категории не найдены</p>
      </div>
    );
  }

  return (
    <ul className={`nav nav-tabs ${className}`} role="tablist">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onClick={onCategorySelect}
          showCount={showCounts}
          count={countsMap ? countsMap[category.id] : undefined}
        />
      ))}
    </ul>
  );
};

/**
 * Скелетон для загрузки категорий
 */
export const CategoryListSkeleton = ({ 
  count = 5, 
  className = '' 
}: { 
  count?: number; 
  className?: string;
}) => {
  return (
    <ul className={`nav nav-tabs ${className}`} role="tablist">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="nav-item">
          <div className="nav-link disabled">
            <div 
              className="bg-light rounded"
              style={{ 
                height: '20px', 
                width: `${60 + Math.random() * 40}px`,
                display: 'inline-block'
              }}
              aria-label="Загрузка категории"
            />
          </div>
        </li>
      ))}
    </ul>
  );
};