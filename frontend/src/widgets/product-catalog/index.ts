// UI Components
export { ProductCatalog } from './ui/product-catalog';
export { CategoryFilter } from './ui/category-filter';
export { LoadMoreButton } from './ui/load-more-button';
export { SearchInput } from './ui/search-input';

// Model exports - Categories
export {
  categoriesStateAtom,
  categoriesSelector,
  categoriesItemsAtom,
  categoriesLoadingAtom,
  categoriesErrorAtom,
  selectedCategoryIdAtom,
  startLoadCategoriesAction,
  loadCategoriesSuccessAction,
  loadCategoriesErrorAction,
  selectCategoryAction,
  loadCategoriesAction,
  getSelectedCategory,
  isCategorySelected
} from './model/categories';

// Model exports - Catalog
export {
  catalogStateAtom,
  catalogSelector,
  catalogItemsAtom,
  catalogLoadingAtom,
  catalogLoadingMoreAtom,
  catalogErrorAtom,
  catalogHasMoreAtom,
  catalogSearchQueryAtom,
  setSearchQueryAction,
  startLoadCatalogAction,
  loadCatalogSuccessAction,
  loadCatalogErrorAction,
  loadCatalogAction,
  loadMoreCatalogAction,
  resetCatalogAction,
  canLoadMore,
  isEmptyState,
  hasItems
} from './model/catalog';

// API exports
export { getCategories, getCategoriesWithAll } from './api/get-categories';
export { getItems, loadMoreItems } from './api/get-items';

// Types
export type { ProductCatalogProps } from './ui/product-catalog';
export type { CategoryFilterProps } from './ui/category-filter';
export type { LoadMoreButtonProps } from './ui/load-more-button';
export type { SearchInputProps } from './ui/search-input';
export type { GetItemsParams } from './api/get-items';