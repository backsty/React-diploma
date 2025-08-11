/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAtom } from '@reatom/npm-react';
import { MainContent } from '@/shared/ui';
import { Banner } from '@/widgets/banner';
import { cartAtom, updateCartItemAction, removeFromCartAction } from '@/shared/store';
import { formatPrice } from '@/shared/lib';
import { ctx } from '@/shared/store';

/**
 * Страница корзины с отображением товаров и формой заказа
 */
export const CartPage = () => {
  const [cart] = useAtom(cartAtom);

  const handleUpdateQuantity = (productId: number, size: string, newCount: number) => {
    updateCartItemAction(ctx, productId, size, newCount);
  };

  const handleRemoveItem = (productId: number, size: string) => {
    removeFromCartAction(ctx, productId, size);
  };

  if (cart.items.length === 0) {
    return (
      <MainContent>
        <div className="row">
          <div className="col">
            <Banner title="К весне готовы!" />
            
            <section className="cart">
              <h2 className="text-center">Корзина</h2>
              <div className="alert alert-info text-center">
                <h5>Корзина пуста</h5>
                <p>Добавьте товары из каталога</p>
              </div>
            </section>
          </div>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <div className="row">
        <div className="col">
          <Banner title="К весне готовы!" />
          
          <section className="cart">
            <h2 className="text-center">Корзина</h2>
            
            <table className="table table-bordered cart-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Название</th>
                  <th scope="col">Размер</th>
                  <th scope="col">Кол-во</th>
                  <th scope="col">Стоимость</th>
                  <th scope="col">Итого</th>
                  <th scope="col">Действия</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item, index) => (
                  <tr key={`${item.id}-${item.size}`}>
                    <td>
                      <img 
                        src={item.image || '/images/placeholder.jpg'}
                        alt={item.title}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>{item.title}</td>
                    <td>{item.size}</td>
                    <td>
                      <div className="cart-item-quantity d-flex align-items-center">
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleUpdateQuantity(item.id, item.size, item.count - 1)}
                          disabled={item.count <= 1}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          className="form-control form-control-sm mx-1 text-center"
                          style={{ width: '60px' }}
                          value={item.count}
                          min="1"
                          max="10"
                          onChange={(e) => {
                            const newCount = parseInt(e.target.value, 10);
                            if (!isNaN(newCount) && newCount > 0) {
                              handleUpdateQuantity(item.id, item.size, newCount);
                            }
                          }}
                        />
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleUpdateQuantity(item.id, item.size, item.count + 1)}
                          disabled={item.count >= 10}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td>{formatPrice(item.price * item.count)}</td>
                    <td>
                      <button 
                        className="cart-item-remove btn btn-outline-danger btn-sm"
                        title="Удалить товар"
                        aria-label="Удалить товар"
                        onClick={() => handleRemoveItem(item.id, item.size)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={5} className="text-right">Общая стоимость:</th>
                  <th>{formatPrice(cart.totalPrice)}</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </section>
          
          <section className="order">
            <h2 className="text-center">Оформить заказ</h2>
            
            <div className="card order-form">
              <form className="card-body">
                <div className="form-group">
                  <label htmlFor="phone">Телефон</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="phone"
                    placeholder="+7 (___) ___-__-__"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Адрес доставки</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="address"
                    placeholder="Введите адрес доставки"
                    required
                  />
                </div>
                
                <div className="form-group form-check">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="agreement"
                    required
                  />
                  <label className="form-check-label" htmlFor="agreement">
                    Согласен с правилами доставки
                  </label>
                </div>
                
                <div className="order-total mb-3">
                  Итого: {formatPrice(cart.totalPrice)}
                </div>
                
                <button type="submit" className="btn btn-outline-secondary btn-lg btn-block">
                  Оформить
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </MainContent>
  );
};