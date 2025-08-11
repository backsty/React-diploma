// UI Components
export { 
  UpdateQuantityButton, 
  IncreaseButton, 
  DecreaseButton,
  QuantityDisplay 
} from './ui/update-quantity-button';

// Model exports
export {
  updateQuantityStateAtom,
  updateQuantitySettingsAtom,
  updateQuantityStateSelector,
  isUpdatingQuantityAtom,
  updatingItemIdAtom,
  updateQuantityErrorAtom,
  pendingOperationsAtom,
  lastOperationAtom,
  canUndoAtom,
  isItemUpdatingAtom,
  hasError,
  startUpdateQuantityAction,
  finishUpdateQuantityAction,
  updateQuantityErrorAction,
  addPendingOperationAction,
  removePendingOperationAction,
  recordLastOperationAction,
  increaseQuantityAction,
  decreaseQuantityAction,
  setQuantityAction,
  undoLastOperationAction,
  resetUpdateQuantityStateAction,
  validateQuantity,
  canIncreaseQuantity,
  canDecreaseQuantity,
  getQuantityLimits,
  getItemQuantity,
  isPendingOperation,
  getPendingOperation
} from './model/update-quantity';

// Types
export type {
  UpdateQuantityState,
  UpdateQuantitySettings
} from './model/update-quantity';

export type {
  UpdateQuantityButtonProps,
  IncreaseButtonProps,
  DecreaseButtonProps,
  QuantityDisplayProps
} from './ui/update-quantity-button';

// // Re-export useful types from store
// export type { CartItem } from '@/shared/store';