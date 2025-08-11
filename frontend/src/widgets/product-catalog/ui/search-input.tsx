import { useState, useEffect, useRef } from 'react';

export interface SearchInputProps {
  className?: string;
  onSearch?: ((query: string) => void) | undefined;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
}

export const SearchInput = ({
  className = '',
  onSearch,
  disabled = false,
  placeholder = 'Поиск',
  initialValue = ''
}: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const prevInitialValueRef = useRef(initialValue);

  useEffect(() => {
    if (initialValue !== prevInitialValueRef.current) {
      setInputValue(initialValue);
      prevInitialValueRef.current = initialValue;
    }
  }, [initialValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearch) {
        onSearch(inputValue.trim());
      }
    }
  };

  const handleClear = () => {
    setInputValue('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form 
      className={`catalog-search-form ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="position-relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="form-control catalog-search-field"
          aria-label="Поиск товаров"
          autoComplete="off"
        />
        
        {/* Кнопка очистки с SVG крестика */}
        {inputValue && (
          <button
            type="button"
            className="search-clear-button position-absolute"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Очистить поиск"
            title="Очистить поиск"
          />
        )}

        {/* Кнопка поиска с SVG лупы */}
        <button
          type="submit"
          className="search-submit-button position-absolute"
          disabled={disabled || !inputValue.trim()}
          aria-label="Выполнить поиск"
          title="Поиск"
        />
      </div>
    </form>
  );
};