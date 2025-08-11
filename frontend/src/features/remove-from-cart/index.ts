// UI Components
export { 
  RemoveButton, 
  QuantityControl, 
  ClearCartButton 
} from './ui/remove-button';

// Model exports
export {
  removeFromCartStateAtom,
  removeFromCartSelector,
  isRemovingFromCartAtom,
  removingItemIdAtom,
  removeFromCartErrorAtom,
  isItemBeingRemovedAtom,
  confirmRemovalAtom,
  handleRemoveFromCartAction,
  handleUpdateCartQuantityAction,
  handleClearCartAction,
  startRemoveFromCartAction,
  removeFromCartSuccessAction,
  removeFromCartErrorAction,
  resetRemoveFromCartStateAction,
  openRemovalConfirmAction,
  closeRemovalConfirmAction,
  canRemoveItem,
  canUpdateQuantity
} from './model/remove-from-cart';

// Types
export type {
  RemoveButtonProps,
  QuantityControlProps,
  ClearCartButtonProps
} from './ui/remove-button';