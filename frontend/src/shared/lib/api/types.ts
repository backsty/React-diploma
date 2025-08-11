export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface ServerError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginationParams {
  offset?: number;
  categoryId?: number | undefined;
  q?: string;
}

// Типы для API endpoints
export interface TopSalesItem {
  id: number;
  category: number;
  title: string;
  price: number;
  images: string[];
}

// Сервер возвращает массивы напрямую, не в обертке
export type TopSalesResponse = TopSalesItem[];
export type CategoriesResponse = Category[];
export type ItemsResponse = Product[];

export interface Category {
  id: number;
  title: string;
}

export interface ProductSize {
  size: string;
  available: boolean;
}

export interface Product {
  id: number;
  category: number;
  title: string;
  images: string[];
  sku: string;
  manufacturer: string;
  color: string;
  material: string;
  reason: string;
  season: string;
  heelSize: string;
  price: number;
  oldPrice?: number;
  sizes: ProductSize[];
}

export interface OrderRequest {
  owner: {
    phone: string;
    address: string;
  };
  items: Array<{
    id: number;
    price: number;
    count: number;
  }>;
}

export interface OrderResponse {
  id: number;
  owner: {
    phone: string;
    address: string;
  };
  items: Array<{
    id: number;
    price: number;
    count: number;
  }>;
}