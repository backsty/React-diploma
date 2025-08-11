export interface ProductSize {
  size: string;
  available: boolean;
}

export interface ProductPreview {
  id: number;
  category: number;
  title: string;
  price: number;
  oldPrice?: number;
  images: string[];
}

export interface Product extends ProductPreview {
  sku: string;
  manufacturer: string;
  color: string;
  material: string;
  reason: string;
  season: string;
  sizes: ProductSize[];
}

export interface ProductState {
  data: Product | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProductsState {
  items: ProductPreview[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  offset: number;
  query: ProductsQuery;
}

export interface TopSalesState {
  items: ProductPreview[];
  isLoading: boolean;
  error: string | null;
}

export interface ProductsQuery {
  categoryId?: number;
  q?: string;
  offset?: number;
}