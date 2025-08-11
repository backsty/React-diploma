import { atom, action } from '@reatom/core';
import { API_CONFIG } from '@/shared/config';

// Атом для состояния поиска
export const searchAtom = atom('', 'headerSearch');

// Атом для видимости формы поиска
export const searchFormVisibleAtom = atom(false, 'searchFormVisible');

// Атом для истории поисковых запросов (для автодополнения)
export const searchHistoryAtom = atom<string[]>([], 'searchHistory');

// Действие для обновления поискового запроса
export const setSearchAction = action((ctx, query: string) => {
  const trimmedQuery = query.trim();
  searchAtom(ctx, trimmedQuery);
  
  // Добавляем в историю поиска если запрос не пустой
  if (trimmedQuery && trimmedQuery.length >= API_CONFIG.SEARCH_MIN_LENGTH) {
    const currentHistory = ctx.get(searchHistoryAtom);
    const newHistory = [
      trimmedQuery,
      ...currentHistory.filter(item => item !== trimmedQuery)
    ].slice(0, 5); // Храним только последние 5 запросов
    
    searchHistoryAtom(ctx, newHistory);
  }
}, 'setSearch');

// Действие для переключения видимости формы поиска
export const toggleSearchFormAction = action((ctx) => {
  const currentVisible = ctx.get(searchFormVisibleAtom);
  searchFormVisibleAtom(ctx, !currentVisible);
}, 'toggleSearchForm');

// Действие для скрытия формы поиска
export const hideSearchFormAction = action((ctx) => {
  searchFormVisibleAtom(ctx, false);
}, 'hideSearchForm');

// Действие для показа формы поиска
export const showSearchFormAction = action((ctx) => {
  searchFormVisibleAtom(ctx, true);
}, 'showSearchForm');

// Действие для очистки поиска
export const clearSearchAction = action((ctx) => {
  searchAtom(ctx, '');
}, 'clearSearch');

// Действие для очистки истории поиска
export const clearSearchHistoryAction = action((ctx) => {
  searchHistoryAtom(ctx, []);
}, 'clearSearchHistory');

// Селектор для получения текущего поискового запроса
export const currentSearchAtom = atom((ctx) => {
  return ctx.spy(searchAtom);
}, 'currentSearch');

// Селектор для проверки активности поиска
export const isSearchActiveAtom = atom((ctx) => {
  const query = ctx.spy(searchAtom);
  return query.length >= API_CONFIG.SEARCH_MIN_LENGTH;
}, 'isSearchActive');

// Селектор для получения истории поиска
export const getSearchHistoryAtom = atom((ctx) => {
  return ctx.spy(searchHistoryAtom);
}, 'getSearchHistory');

export { useHeaderSearch } from './use-header-search';