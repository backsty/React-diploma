// Feature: Add to Cart
export {
  AddToCartForm,
  SizeSelector,
  QuantitySelector,
  addToCartStateAtom,
  addToCartSelector,
  isAddingToCartAtom,
  addToCartErrorAtom,
  handleAddToCartAction,
  startAddToCartAction,
  addToCartSuccessAction,
  addToCartErrorAction,
  resetAddToCartStateAction,
  validateAddToCartForm
} from './add-to-cart';

export type {
  AddToCartFormProps,
  SizeSelectorProps,
  QuantitySelectorProps
} from './add-to-cart';

// Feature: Filter by Category
export {
  CategoryTabs,
  SimpleCategoryTabs,
  CategoryTabsWithSearch,
  // useCategoryFilter,
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
} from './filter-by-category';

export type {
  CategoryTabsProps,
  SimpleCategoryTabsProps,
  CategoryTabsWithSearchProps,
  CategoryFilterState,
  FilterProductsParams,
  CategoryFilterHistory
} from './filter-by-category';

// Feature: Place Order
export {
  OrderForm,
  OrderSummary,
  QuickOrderForm,
  placeOrder,
  formatPhoneForApi,
  validatePlaceOrderData,
  calculateOrderTotal,
  calculateOrderItemsCount,
  generateOrderSummary,
  retryPlaceOrder,
  placeOrderStateAtom,
  placeOrderSettingsAtom,
  placeOrderStateSelector,
  canSubmitOrderAtom,
  isOrderProcessingAtom,
  orderStepAtom,
  canRetryOrderAtom,
  orderFormValidationSelector,
  orderSummaryAtom,
  setAgreementAction,
  setPlaceOrderStepAction,
  startPlaceOrderAction,
  placeOrderSuccessAction,
  placeOrderErrorAction,
  submitOrderAction,
  retryOrderAction,
  resetPlaceOrderAction,
  updateOrderFieldAction,
  validateOrderForm,
  getOrderProgress,
  isFormFieldValid,
  getRetryInfo
} from './place-order';

export type {
  PlaceOrderState,
  PlaceOrderSettings,
  PlaceOrderData,
  PlaceOrderResult,
  OrderFormProps,
  OrderSummaryProps,
  QuickOrderFormProps,
  // ApiPlaceOrderData,
  // ApiPlaceOrderResult
} from './place-order';

// Feature: Remove from Cart
export {
  RemoveButton,
  QuantityControl,
  ClearCartButton,
  removeFromCartStateAtom,
  removeFromCartSelector,
  isRemovingFromCartAtom,
  removingItemIdAtom,
  removeFromCartErrorAtom,
  isItemBeingRemovedAtom,
  confirmRemovalAtom,
  handleRemoveFromCartAction,
  handleUpdateCartQuantityAction,
  handleClearCartAction,
  startRemoveFromCartAction,
  removeFromCartSuccessAction,
  removeFromCartErrorAction,
  resetRemoveFromCartStateAction,
  openRemovalConfirmAction,
  closeRemovalConfirmAction,
  canRemoveItem,
  canUpdateQuantity
} from './remove-from-cart';

export type {
  RemoveButtonProps,
  QuantityControlProps,
  ClearCartButtonProps
} from './remove-from-cart';

// Feature: Search Products
export {
  SearchForm,
  QuickSearch,
  AdvancedSearch,
  searchStateAtom,
  searchFiltersAtom,
  searchHistoryAtom,
  searchSelector,
  searchQueryAtom,
  searchResultsAtom,
  isSearchingAtom,
  searchErrorAtom,
  hasSearchResultsAtom,
  searchFiltersSelector,
  searchHistorySelector,
  canSearchAtom,
  searchStatsAtom,
  setSearchQueryAction,
  startSearchAction,
  searchSuccessAction,
  searchErrorAction,
  performSearchAction,
  clearSearchAction,
  setSearchFiltersAction,
  clearSearchFiltersAction,
  addToSearchHistoryAction,
  clearSearchHistoryAction,
  searchFromHistoryAction,
  resetSearchStateAction,
  validateSearchQuery,
  formatSearchResults
} from './search-products';

export type {
  SearchFormProps,
  QuickSearchProps,
  AdvancedSearchProps,
  SearchState,
  SearchFilters,
  SearchHistory
} from './search-products';

// Feature: Update Cart Quantity
export {
  UpdateQuantityButton,
  IncreaseButton,
  DecreaseButton,
  QuantityDisplay,
  updateQuantityStateAtom,
  updateQuantitySettingsAtom,
  updateQuantityStateSelector,
  isUpdatingQuantityAtom,
  updatingItemIdAtom,
  updateQuantityErrorAtom,
  pendingOperationsAtom,
  lastOperationAtom,
  canUndoAtom,
  isItemUpdatingAtom,
  hasError,
  startUpdateQuantityAction,
  finishUpdateQuantityAction,
  updateQuantityErrorAction,
  addPendingOperationAction,
  removePendingOperationAction,
  recordLastOperationAction,
  increaseQuantityAction,
  decreaseQuantityAction,
  setQuantityAction,
  undoLastOperationAction,
  resetUpdateQuantityStateAction,
  validateQuantity,
  canIncreaseQuantity,
  canDecreaseQuantity,
  getQuantityLimits,
  getItemQuantity,
  isPendingOperation,
  getPendingOperation
} from './update-cart-quantity';

export type {
  UpdateQuantityState,
  UpdateQuantitySettings,
  UpdateQuantityButtonProps,
  IncreaseButtonProps,
  DecreaseButtonProps,
  QuantityDisplayProps
} from './update-cart-quantity';

// Common feature types
export type { Category } from '@/entities/category';
export type { Product } from '@/entities/product';
// export type { CartItem } from '@/shared/store';

// Feature utilities
export const FEATURES = {
  ADD_TO_CART: 'add-to-cart',
  FILTER_BY_CATEGORY: 'filter-by-category',
  PLACE_ORDER: 'place-order',
  REMOVE_FROM_CART: 'remove-from-cart',
  SEARCH_PRODUCTS: 'search-products',
  UPDATE_CART_QUANTITY: 'update-cart-quantity'
} as const;

export type FeatureName = typeof FEATURES[keyof typeof FEATURES];

// Feature configurations
export interface FeatureConfig {
  enabled: boolean;
  name: string;
  description: string;
  dependencies?: FeatureName[];
}

export const FEATURE_CONFIGS: Record<FeatureName, FeatureConfig> = {
  [FEATURES.ADD_TO_CART]: {
    enabled: true,
    name: 'Добавление в корзину',
    description: 'Добавление товаров в корзину с выбором размера и количества'
  },
  [FEATURES.FILTER_BY_CATEGORY]: {
    enabled: true,
    name: 'Фильтрация по категориям',
    description: 'Фильтрация товаров по категориям с пагинацией'
  },
  [FEATURES.PLACE_ORDER]: {
    enabled: true,
    name: 'Оформление заказа',
    description: 'Оформление заказа с валидацией и обработкой ошибок',
    dependencies: [FEATURES.ADD_TO_CART]
  },
  [FEATURES.REMOVE_FROM_CART]: {
    enabled: true,
    name: 'Удаление из корзины',
    description: 'Удаление товаров из корзины с подтверждением',
    dependencies: [FEATURES.ADD_TO_CART]
  },
  [FEATURES.SEARCH_PRODUCTS]: {
    enabled: true,
    name: 'Поиск товаров',
    description: 'Поиск товаров с фильтрами и историей запросов'
  },
  [FEATURES.UPDATE_CART_QUANTITY]: {
    enabled: true,
    name: 'Изменение количества',
    description: 'Изменение количества товаров в корзине с отменой операций',
    dependencies: [FEATURES.ADD_TO_CART]
  }
};

// Feature validation
export const isFeatureEnabled = (featureName: FeatureName): boolean => {
  const config = FEATURE_CONFIGS[featureName];
  if (!config) return false;
  
  // Проверяем зависимости
  if (config.dependencies) {
    return config.enabled && config.dependencies.every(isFeatureEnabled);
  }
  
  return config.enabled;
};

export const getEnabledFeatures = (): FeatureName[] => {
  return (Object.keys(FEATURE_CONFIGS) as FeatureName[]).filter(isFeatureEnabled);
};

export const getFeatureInfo = (featureName: FeatureName): FeatureConfig | null => {
  return FEATURE_CONFIGS[featureName] || null;
};

// Development helpers
export const logEnabledFeatures = (): void => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.group('🔧 Enabled Features:');
    getEnabledFeatures().forEach(feature => {
      const config = getFeatureInfo(feature);
      // eslint-disable-next-line no-console
      console.log(`✅ ${config?.name} (${feature}): ${config?.description}`);
    });
    // eslint-disable-next-line no-console
    console.groupEnd();
  }
};

// Auto-log features in development
if (process.env.NODE_ENV === 'development') {
  logEnabledFeatures();
}
