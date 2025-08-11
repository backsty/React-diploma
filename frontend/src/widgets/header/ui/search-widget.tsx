import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from '@reatom/npm-react';
import { getCatalogRoute } from '@/shared/config';
import { 
  searchFormVisibleAtom, 
  toggleSearchFormAction, 
  hideSearchFormAction,
  setSearchAction
} from '../model/search';
import { ctx } from '@/shared/store';

export interface SearchWidgetProps {
  className?: string;
}

export const SearchWidget = ({ className = '' }: SearchWidgetProps) => {
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState('');
  const [searchFormVisible] = useAtom(searchFormVisibleAtom);
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус при открытии формы
  useEffect(() => {
    if (searchFormVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [searchFormVisible]);

  // Скрытие формы при клике вне её
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const searchForm = target.closest('.header-controls-search-form');
      const searchButton = target.closest('.header-controls-search');
      
      if (!searchForm && !searchButton && searchFormVisible) {
        hideSearchFormAction(ctx);
        setLocalQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchFormVisible]);

  const handleToggleSearch = () => {
    toggleSearchFormAction(ctx);
    if (!searchFormVisible) {
      setLocalQuery('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = () => {
    const trimmedQuery = localQuery.trim();
    if (trimmedQuery) {
      setSearchAction(ctx, trimmedQuery);
      
      const catalogUrl = getCatalogRoute({ q: trimmedQuery });
      navigate(catalogUrl);
      hideSearchFormAction(ctx);
      setLocalQuery('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalQuery(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideSearchFormAction(ctx);
      setLocalQuery('');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  };

  return (
    <div className={`position-relative ${className}`}>
      {/* Иконка поиска */}
      <div 
        className={`header-controls-pic header-controls-search ${searchFormVisible ? 'hidden' : ''}`}
        onClick={handleToggleSearch}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleSearch();
          }
        }}
        aria-label="Поиск"
        title="Поиск"
      />

      {/* Форма поиска */}
      {searchFormVisible && (
        <form 
          className="header-controls-search-form"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск"
            value={localQuery}
            onChange={handleInputChange}
            className="form-control"
            autoComplete="off"
          />
          <button 
            type="button"
            className="search-submit"
            onClick={handleSearchClick}
            disabled={!localQuery.trim()}
            aria-label="Выполнить поиск"
            title="Поиск"
          />
        </form>
      )}
    </div>
  );
};