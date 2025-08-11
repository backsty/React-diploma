// UI Components
export { 
  SearchForm, 
  QuickSearch, 
  AdvancedSearch 
} from './ui/search-form';

// Model exports
export {
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
} from './model/search';

// Types
export type {
  SearchFormProps,
  QuickSearchProps,
  AdvancedSearchProps
} from './ui/search-form';

// Export search state types for external use
export type {
  SearchState,
  SearchFilters,
  SearchHistory
} from './model/search';

// Re-export useful types from entities
export type { Product } from '@/entities/product';