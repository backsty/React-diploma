// Базовая категория товаров из API
export interface Category {
  id: number;
  title: string;
}

// Состояние списка категорий
export interface CategoriesState {
  items: Category[];
  selectedId: number | null;
  isLoading: boolean;
  error: string | null;
}

// Расширенная категория с дополнительными флагами
export interface ExtendedCategory extends Category {
  isAll?: boolean | undefined; // Флаг для категории "Все"
  count?: number | undefined;  // Количество товаров в категории (опционально)
}

// Параметры для фильтрации по категории
export interface CategoryFilter {
  categoryId: number | null;
  title: string;
}

// Параметры для валидации категории
export interface CategoryValidation {
  isValid: boolean;
  error?: string | undefined;
}

// Опции для загрузки категорий
export interface CategoriesLoadOptions {
  withCounts?: boolean | undefined;
  includeEmpty?: boolean | undefined;
}