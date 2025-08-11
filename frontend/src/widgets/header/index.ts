export { Header } from './ui/header';
export { SearchWidget } from './ui/search-widget';
export type { SearchWidgetProps } from './ui/search-widget';

// Экспорт модели поиска
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
} from './model/search';