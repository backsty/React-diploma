// Проверка доступности localStorage
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export const localStorage = {
  get<T>(key: string, defaultValue: T): T {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available');
      return defaultValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available');
      return;
    }
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  remove(key: string): void {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available');
      return;
    }
    
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear(): void {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available');
      return;
    }
    
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  has(key: string): boolean {
    if (!isStorageAvailable()) {
      return false;
    }
    
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking localStorage key "${key}":`, error);
      return false;
    }
  }
};