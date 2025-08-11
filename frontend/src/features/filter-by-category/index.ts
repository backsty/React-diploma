// UI Components
export { 
  CategoryTabs, 
  SimpleCategoryTabs, 
  CategoryTabsWithSearch
} from './ui/category-tabs';

// Hooks - временно убираем, пока не создан файл
// export { useCategoryFilter } from './hooks/use-category-filter';

// Model exports
export {
  categoryFilterAtom,
  categoryFilterHistoryAtom,
  categoryFilterSelector,
  selectedCategoryIdAtom,
  filteredProductsAtom,
  categoryFilterLoadingAtom,
  categoryFilterErrorAtom,
  hasMoreProductsAtom,
  canLoadMoreAtom,
  categoryFilterStatsAtom,
  categoryFilterHistorySelector,
  isAllCategoriesSelectedAtom,
  startCategoryFilterAction,
  setCategoryFilterResultsAction,
  setCategoryFilterErrorAction,
  setSelectedCategoryAction,
  filterProductsByCategoryAction,
  loadMoreProductsAction,
  resetCategoryFilterAction,
  updateCategoryHistoryAction,
  clearCategoryHistoryAction,
  cleanupCategoryFilterAction,
  isCategorySelected,
  getFilteredProductsCount,
  getCategoryFilterState,
  validateCategoryFilter,
  getCategoryFilterText,
  getAdjacentCategory
} from './model/category-filter';

// Types
export type {
  CategoryTabsProps,
  SimpleCategoryTabsProps,
  CategoryTabsWithSearchProps
} from './ui/category-tabs';

// Export model types for external use
export type {
  CategoryFilterState,
  FilterProductsParams,
  CategoryFilterHistory
} from './model/category-filter';

// Re-export useful types from entities
export type { Category } from '@/entities/category';
export type { Product } from '@/entities/product';