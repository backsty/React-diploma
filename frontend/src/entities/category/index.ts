// UI Components
export { 
  CategoryItem, 
  CategoryList,
  CategoryListSkeleton 
} from './ui/category-item';

// Model - Atoms & Actions
export {
  categoriesAtom,
  selectedCategoryIdAtom,
  selectedCategoryDataAtom,
  isAllCategoriesSelectedAtom,
  categoriesListAtom,
  availableCategoriesAtom,
  getCategoriesCountAtom,
  hasErrorAtom,
  isLoadingAtom,
  setCategoriesLoadingAction,
  setCategoriesDataAction,
  setCategoriesErrorAction,
  setSelectedCategoryAction,
  resetCategoriesAction,
  getCategoryById,
  isCategorySelected,
  getCategoryTitle,
  validateCategoryId,
  ALL_CATEGORIES_ID,
  ALL_CATEGORIES_TITLE
} from './model/category';

// API Methods
export { 
  getCategories, 
  getCategoryById as getCategoryByIdApi,
  validateCategoryExists 
} from './api/get-categories';

// Types
export type { 
  Category, 
  CategoriesState, 
  ExtendedCategory,
  CategoryFilter,
  CategoryValidation,
  CategoriesLoadOptions
} from './model/types';

// UI Props Types
export type {
  CategoryItemProps,
  CategoryListProps
} from './ui/category-item';