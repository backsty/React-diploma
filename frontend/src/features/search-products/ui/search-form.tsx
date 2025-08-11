import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAtom } from '@reatom/npm-react';
import { Button, Input, ErrorMessage, Loader, EmptyState } from '@/shared/ui';
import { useDebounce } from '@/shared/lib';
import { getCatalogRoute, API_CONFIG } from '@/shared/config';
import { 
  searchSelector,
  searchHistorySelector,
  searchFiltersSelector,
  canSearchAtom,
  searchStatsAtom,
  setSearchQueryAction,
  performSearchAction,
  clearSearchAction,
  searchFromHistoryAction,
  clearSearchHistoryAction,
  setSearchFiltersAction,
  validateSearchQuery,
  resetSearchStateAction
} from '../model/search';
import { ctx } from '@/shared/store';
import type { Product } from '@/entities/product';

export interface SearchFormProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  showHistory?: boolean;
  showFilters?: boolean;
  onSearchComplete?: ((results: Product[], query: string) => void) | undefined;
  onQueryChange?: ((query: string) => void) | undefined;
  inline?: boolean;
  fullWidth?: boolean;
}

export const SearchForm = ({
  className = '',
  placeholder = 'Поиск товаров...',
  autoFocus = false,
  showHistory = true,
  showFilters = false,
  onSearchComplete,
  onQueryChange,
  inline = false,
  fullWidth = false
}: SearchFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchState] = useAtom(searchSelector);
  const [searchHistory] = useAtom(searchHistorySelector);
  const [searchFilters] = useAtom(searchFiltersSelector);
  const [canSearch] = useAtom(canSearchAtom);
  const [searchStats] = useAtom(searchStatsAtom);
  
  const [localQuery, setLocalQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Дебаунс для живого поиска
  const debouncedQuery = useDebounce(localQuery, API_CONFIG.SEARCH_DEBOUNCE || 500);
  
  // Функция живого поиска с useCallback для стабильной ссылки
  const handleLiveSearch = useCallback(async (query: string) => {
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      return;
    }
    
    setValidationError(null);
    
    const result = await performSearchAction(ctx, query);
    
    if (result.success && onSearchComplete) {
      onSearchComplete(result.results || [], query);
    }
  }, [onSearchComplete]);
  
  // Инициализация из URL параметров
  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl && queryFromUrl !== localQuery) {
      setLocalQuery(queryFromUrl);
      setSearchQueryAction(ctx, queryFromUrl);
    }
  }, [searchParams, localQuery]);
  
  // Автофокус
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Живой поиск при изменении дебаунсированного запроса
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= API_CONFIG.SEARCH_MIN_LENGTH) {
      handleLiveSearch(debouncedQuery);
    }
  }, [debouncedQuery, handleLiveSearch]);
  
  // Скрытие подсказок при клике вне формы
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setLocalQuery(newQuery);
    setSearchQueryAction(ctx, newQuery);
    
    if (onQueryChange) {
      onQueryChange(newQuery);
    }
    
    // Показываем подсказки если есть история и запрос не пустой
    setShowSuggestions(newQuery.length > 0 && searchHistory.queries.length > 0);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSearchQuery(localQuery);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      return;
    }
    
    setValidationError(null);
    setShowSuggestions(false);
    
    // Выполняем поиск
    const result = await performSearchAction(ctx, localQuery);
    
    if (result.success) {
      // Переходим в каталог с результатами поиска
      const catalogUrl = getCatalogRoute({ q: localQuery });
      navigate(catalogUrl);
      
      if (onSearchComplete) {
        onSearchComplete(result.results || [], localQuery);
      }
    }
  };
  
  const handleSuggestionClick = async (suggestion: string) => {
    setLocalQuery(suggestion);
    setShowSuggestions(false);
    
    const result = await searchFromHistoryAction(ctx, suggestion);
    
    if (result.success) {
      const catalogUrl = getCatalogRoute({ q: suggestion });
      navigate(catalogUrl);
      
      if (onSearchComplete) {
        onSearchComplete(result.results || [], suggestion);
      }
    }
  };
  
  const handleClearSearch = () => {
    setLocalQuery('');
    setValidationError(null);
    setShowSuggestions(false);
    clearSearchAction(ctx);
    
    if (onQueryChange) {
      onQueryChange('');
    }
  };
  
  const handleClearHistory = () => {
    clearSearchHistoryAction(ctx);
    setShowSuggestions(false);
  };
  
  const handleFilterChange = (filterName: keyof typeof searchFilters, value: unknown) => {
    setSearchFiltersAction(ctx, { [filterName]: value });
    
    // Повторяем поиск с новыми фильтрами если есть запрос
    if (localQuery && localQuery.length >= API_CONFIG.SEARCH_MIN_LENGTH) {
      performSearchAction(ctx, localQuery);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };
  
  const handleFocus = () => {
    if (localQuery.length > 0 && searchHistory.queries.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  const filteredSuggestions = searchHistory.queries
    .filter(query => 
      query.toLowerCase().includes(localQuery.toLowerCase()) && 
      query !== localQuery
    )
    .slice(0, 5);
  
  return (
    <div className={`search-form-wrapper position-relative ${className}`}>
      <form 
        ref={formRef}
        className={`search-form ${inline ? 'd-flex align-items-center' : ''}`}
        onSubmit={handleSubmit}
      >
        {/* Основное поле поиска */}
        <div className={`search-input-wrapper ${fullWidth ? 'flex-grow-1' : ''}`}>
          <Input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            fullWidth={fullWidth}
            className="search-input"
            error={validationError || undefined}
            rightIcon={
              <div className="d-flex align-items-center gap-1">
                {searchState.isSearching && <Loader size="sm" />}
                {localQuery && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0"
                    onClick={handleClearSearch}
                    aria-label="Очистить поиск"
                  >
                    ✕
                  </button>
                )}
              </div>
            }
          />
        </div>
        
        {/* Кнопка поиска */}
        <div className={inline ? 'ms-2' : 'mt-2'}>
          <Button
            type="submit"
            variant="primary"
            disabled={!canSearch}
            loading={searchState.isSearching}
            className={fullWidth && !inline ? 'w-100' : ''}
          >
            {searchState.isSearching ? 'Поиск...' : 'Найти'}
          </Button>
        </div>
      </form>
      
      {/* Подсказки из истории */}
      {showSuggestions && showHistory && filteredSuggestions.length > 0 && (
        <div className="search-suggestions position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, top: '100%' }}>
          <div className="p-2 border-bottom d-flex justify-content-between align-items-center">
            <small className="text-muted">История поиска:</small>
            <button
              type="button"
              className="btn btn-link btn-sm p-0"
              onClick={handleClearHistory}
              title="Очистить историю"
            >
              Очистить
            </button>
          </div>
          
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="btn btn-link text-start w-100 p-2 border-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <small>🔍 {suggestion}</small>
            </button>
          ))}
        </div>
      )}
      
      {/* Фильтры поиска */}
      {showFilters && (
        <div className="search-filters mt-3 p-3 bg-light rounded">
          <h6>Фильтры поиска</h6>
          
          <div className="row">
            <div className="col-md-4">
              <Input
                type="number"
                label="Цена от"
                value={searchFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
              />
            </div>
            
            <div className="col-md-4">
              <Input
                type="number"
                label="Цена до"
                value={searchFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                min="0"
              />
            </div>
            
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inStockFilter"
                  checked={searchFilters.inStock || false}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="inStockFilter">
                  Только в наличии
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ошибка поиска */}
      {searchState.error && (
        <div className="mt-2">
          <ErrorMessage message={searchState.error} variant="text" />
        </div>
      )}
      
      {/* Статистика поиска */}
      {searchStats.hasSearched && !searchState.isSearching && (
        <div className="search-stats mt-2">
          {searchStats.hasResults ? (
            <small className="text-muted">
              Найдено товаров: {searchStats.totalFound}
            </small>
          ) : (
            <EmptyState
              title="Ничего не найдено"
              description={`По запросу "${localQuery}" товары не найдены`}
              icon="🔍"
              action={{
                label: 'Очистить поиск',
                onClick: handleClearSearch
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Компонент быстрого поиска для шапки
export interface QuickSearchProps {
  className?: string;
  onClose?: (() => void) | undefined;
}

export const QuickSearch = ({ className = '', onClose }: QuickSearchProps) => {
  return (
    <div className={`quick-search ${className}`}>
      <SearchForm
        placeholder="Быстрый поиск..."
        autoFocus
        inline
        fullWidth
        showHistory
        onSearchComplete={() => {
          if (onClose) {
            onClose();
          }
        }}
      />
    </div>
  );
};

// Компонент расширенного поиска для страницы каталога
export interface AdvancedSearchProps {
  className?: string;
  initialQuery?: string;
  onResultsChange?: ((results: Product[]) => void) | undefined;
}

export const AdvancedSearch = ({ 
  className = '', 
  initialQuery = '',
  onResultsChange 
}: AdvancedSearchProps) => {
  useEffect(() => {
    if (initialQuery) {
      setSearchQueryAction(ctx, initialQuery);
    }
    
    return () => {
      // Очищаем состояние при размонтировании
      resetSearchStateAction(ctx);
    };
  }, [initialQuery]);
  
  return (
    <div className={`advanced-search ${className}`}>
      <SearchForm
        placeholder="Поиск по каталогу..."
        showHistory
        showFilters
        fullWidth
        onSearchComplete={(results) => {
          if (onResultsChange) {
            onResultsChange(results);
          }
        }}
      />
    </div>
  );
};