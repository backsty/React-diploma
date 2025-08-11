import { useAtom } from '@reatom/npm-react';
import { useDebounce } from '@/shared/lib';
import { API_CONFIG } from '@/shared/config';
import { searchAtom } from './search';

// Хук для использования поиска с debounce
export const useHeaderSearch = () => {
  const [query] = useAtom(searchAtom);
  const debouncedQuery = useDebounce(query, API_CONFIG.SEARCH_DEBOUNCE || 300);
  
  return {
    query,
    debouncedQuery,
    isSearching: query !== debouncedQuery
  };
};