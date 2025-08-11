/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_PROD_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_PROD_BASE_URL: string;
  readonly VITE_CART_STORAGE_KEY: string;
  readonly VITE_CATALOG_ITEMS_PER_PAGE: string;
  readonly VITE_SEARCH_DEBOUNCE_MS: string;
  readonly VITE_SEARCH_MIN_LENGTH: string;
  readonly VITE_MIN_QUANTITY: string;
  readonly VITE_MAX_QUANTITY: string;
  readonly VITE_PHONE_PATTERN: string;
  readonly VITE_ADDRESS_MIN_LENGTH: string;
  readonly VITE_DEBUG_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}