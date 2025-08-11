import { apiClient } from '@/shared/lib/api';
import type { TopSalesItem } from '@/shared/lib/api';

export const getTopSales = async (): Promise<TopSalesItem[]> => {
  return apiClient.get<TopSalesItem[]>('/api/top-sales');
};