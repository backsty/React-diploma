import { useAtom } from '@reatom/npm-react';
import { formatPrice } from '@/shared/lib';
import { cartAtom } from '../model/cart';

export interface CartSummaryProps {
  className?: string;
}

export const CartSummary = ({ className = '' }: CartSummaryProps) => {
  const [cart] = useAtom(cartAtom);

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <tfoot className={className}>
      <tr>
        <th colSpan={5} className="text-right">
          Общая стоимость:
        </th>
        <th>{formatPrice(cart.totalPrice)}</th>
        <th></th>
      </tr>
    </tfoot>
  );
};