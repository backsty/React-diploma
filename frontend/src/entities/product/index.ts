// UI Components
export { 
  ProductCard, 
  ProductCardList,
  ProductCardSkeleton,
  ProductCardListSkeleton
} from './ui/product-card';

export { 
  ProductDetails,
  ProductDetailsSkeleton
} from './ui/product-details';

// Model - Atoms & Actions
export {
  productAtom,
  productsAtom,
  topSalesAtom,
  selectedSizesAtom,
  productQuantitiesAtom,
  currentProductAtom,
  productsListAtom,
  topSalesListAtom,
  hasProductsAtom,
  canLoadMoreAtom,
  isAnyProductLoadingAtom,
  setProductLoadingAction,
  setProductDataAction,
  setProductErrorAction,
  clearProductAction,
  setProductsLoadingAction,
  setProductsDataAction,
  setProductsErrorAction,
  setProductsQueryAction,
  clearProductsAction,
  setTopSalesLoadingAction,
  setTopSalesDataAction,
  setTopSalesErrorAction,
  clearTopSalesAction,
  setSelectedSizeAction,
  clearSelectedSizeAction,
  setProductQuantityAction,
  clearProductQuantityAction,
  getSelectedSize,
  getProductQuantity,
  hasAvailableSizes,
  canAddToCart,
  getAvailableSizes,
  getProductMainImage
} from './model/product';

// API Methods
export { 
  getProduct, 
  getProducts, 
  getTopSales,
  searchProducts,
  loadMoreProducts,
  checkProductExists
} from './api/get-product';

// Types
export type {
  Product,
  ProductPreview,
  ProductSize,
  ProductState,
  ProductsState,
  TopSalesState,
  ProductsQuery
} from './model/types';

// UI Props Types
export type {
  ProductCardProps,
  ProductCardListProps
} from './ui/product-card';

export type {
  ProductDetailsProps
} from './ui/product-details';