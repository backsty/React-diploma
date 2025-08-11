// Header Widget
export { Header, SearchWidget } from './header';
export type { SearchWidgetProps } from './header';
export {
  searchAtom,
  searchFormVisibleAtom,
  searchHistoryAtom,
  setSearchAction,
  toggleSearchFormAction,
  hideSearchFormAction,
  showSearchFormAction,
  clearSearchAction,
  clearSearchHistoryAction,
  currentSearchAtom,
  isSearchActiveAtom,
  getSearchHistoryAtom,
  useHeaderSearch
} from './header';

// Footer Widget
export { Footer } from './footer';

// Banner Widget
export { Banner } from './banner';
export type { BannerProps } from './banner';

// Cart Widget
export { CartWidget } from './cart-widget';
export type { CartWidgetProps } from './cart-widget';
export {
  cartItemsCountAtom,
  cartTotalQuantityAtom,
  hasCartItemsAtom
} from './cart-widget';

// Product Catalog Widget
export { ProductCatalog, CategoryFilter, LoadMoreButton, SearchInput } from './product-catalog';
export type {
  ProductCatalogProps,
  CategoryFilterProps,
  LoadMoreButtonProps,
  SearchInputProps,
  GetItemsParams
} from './product-catalog';
export {
  // Categories model
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
  isCategorySelected,
  // Catalog model
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
  hasItems,
  // API functions
  getCategories,
  getCategoriesWithAll,
  getItems,
  loadMoreItems
} from './product-catalog';

// Top Sales Widget
export { TopSales } from './top-sales';
export type { TopSalesProps } from './top-sales';
export {
  topSalesStateAtom,
  topSalesSelector,
  topSalesItemsAtom,
  topSalesLoadingAtom,
  topSalesErrorAtom,
  hasTopSalesAtom,
  startLoadTopSalesAction,
  loadTopSalesSuccessAction,
  loadTopSalesErrorAction,
  loadTopSalesAction,
  resetTopSalesAction,
  canLoadTopSales,
  isEmptyTopSales,
  getTopSalesCount,
  getTopSales
} from './top-sales';