import { useEffect, useState } from 'react';
import { useAtom } from '@reatom/npm-react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, ErrorMessage, Loader } from '@/shared/ui';
import { formatPrice, MESSAGES } from '@/shared/lib';
import { ROUTES } from '@/shared/config';
import {
  orderFormSelector,
  orderFormValidationAtom,
  orderLoadingAtom,
  orderSuccessAtom,
  orderErrorAtom,
  lastOrderIdAtom
} from '@/entities/order';
import {
  placeOrderStateSelector,
  canSubmitOrderAtom,
  isOrderProcessingAtom,
  orderStepAtom,
  canRetryOrderAtom,
  orderSummaryAtom,
  submitOrderAction,
  retryOrderAction,
  setAgreementAction,
  updateOrderFieldAction,
  resetPlaceOrderAction,
  getOrderProgress
} from '../model/order';
import { ctx } from '@/shared/store';

export interface OrderFormProps {
  className?: string;
  onOrderSuccess?: ((orderId: string) => void) | undefined;
  onOrderError?: ((error: string) => void) | undefined;
  showSummary?: boolean;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

export const OrderForm = ({
  className = '',
  onOrderSuccess,
  onOrderError,
  showSummary = true,
  autoRedirect = false,
  redirectDelay = 3000
}: OrderFormProps) => {
  const navigate = useNavigate();
  
  // Подписки на атомы
  const [orderForm] = useAtom(orderFormSelector);
  const [formValidation] = useAtom(orderFormValidationAtom);
  const [placeOrderState] = useAtom(placeOrderStateSelector);
  const [canSubmit] = useAtom(canSubmitOrderAtom);
  const [isProcessing] = useAtom(isOrderProcessingAtom);
  const [orderStep] = useAtom(orderStepAtom);
  const [canRetry] = useAtom(canRetryOrderAtom);
  const [orderSummary] = useAtom(orderSummaryAtom);
  const [isOrderLoading] = useAtom(orderLoadingAtom);
  const [orderSuccess] = useAtom(orderSuccessAtom);
  const [orderError] = useAtom(orderErrorAtom);
  const [lastOrderId] = useAtom(lastOrderIdAtom);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Сброс состояния при монтировании
  useEffect(() => {
    resetPlaceOrderAction(ctx);
    setIsSubmitted(false);
  }, []);
  
  // Обработка успешного заказа
  useEffect(() => {
    if (orderSuccess && lastOrderId) {
      if (onOrderSuccess) {
        onOrderSuccess(lastOrderId);
      }
      
      if (autoRedirect) {
        setTimeout(() => {
          navigate(ROUTES.HOME);
        }, redirectDelay);
      }
    }
  }, [orderSuccess, lastOrderId, onOrderSuccess, autoRedirect, redirectDelay, navigate]);
  
  // Обработка ошибки заказа
  useEffect(() => {
    if (orderError) {
      setIsSubmitted(false);
      if (onOrderError) {
        onOrderError(orderError);
      }
    }
  }, [orderError, onOrderError]);
  
  // Обработчики формы
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOrderFieldAction(ctx, 'phone', e.target.value);
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOrderFieldAction(ctx, 'address', e.target.value);
  };
  
  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreementAction(ctx, e.target.checked);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit || isProcessing) {
      return;
    }
    
    setIsSubmitted(true);
    
    try {
      await submitOrderAction(ctx);
    } catch (error) {
      console.error('Ошибка отправки заказа:', error);
      setIsSubmitted(false);
    }
  };
  
  const handleRetry = async () => {
    if (!canRetry) return;
    
    setIsSubmitted(true);
    
    try {
      await retryOrderAction(ctx);
    } catch (error) {
      console.error('Ошибка повтора заказа:', error);
      setIsSubmitted(false);
    }
  };
  
  const handleReset = () => {
    resetPlaceOrderAction(ctx);
    setIsSubmitted(false);
  };
  
  // Получаем прогресс
  const progress = getOrderProgress(ctx);
  
  // Проверяем пустую корзину
  if (orderSummary.isEmpty) {
    return (
      <div className={`order-form-empty ${className}`}>
        <div className="alert alert-warning">
          <h5>Корзина пуста</h5>
          <p>Добавьте товары в корзину, чтобы оформить заказ</p>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.CATALOG)}
          >
            Перейти в каталог
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`order-form ${className}`}>
      {/* Прогресс оформления */}
      <div className="order-progress mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h4>Оформление заказа</h4>
          <span className="badge bg-primary">
            Шаг {progress.step} из {progress.totalSteps}
          </span>
        </div>
        <div className="progress mt-2">
          <div 
            className="progress-bar" 
            style={{ width: `${(progress.step / progress.totalSteps) * 100}%` }}
          />
        </div>
        <small className="text-muted mt-1">{progress.stepName}</small>
      </div>
      
      {/* Краткая информация о заказе */}
      {showSummary && (
        <div className="order-summary mb-4 p-3 bg-light rounded">
          <h6>Ваш заказ:</h6>
          <div className="d-flex justify-content-between">
            <span>Товаров: {orderSummary.itemsCount}</span>
            <strong>{formatPrice(orderSummary.totalPrice)}</strong>
          </div>
        </div>
      )}
      
      {/* Форма заказа */}
      {orderStep === 'form' && (
        <form onSubmit={handleSubmit} className="order-form-content">
          <div className="row">
            <div className="col-md-6">
              <Input
                label="Номер телефона *"
                type="tel"
                value={orderForm.phone}
                onChange={handlePhoneChange}
                placeholder="+7 (___) ___-__-__"
                error={formValidation.errors.phone || undefined}
                disabled={isProcessing}
                required
              />
            </div>
            
            <div className="col-md-6">
              <Input
                label="Адрес доставки *"
                type="text"
                value={orderForm.address}
                onChange={handleAddressChange}
                placeholder="Введите полный адрес доставки"
                error={formValidation.errors.address || undefined}
                disabled={isProcessing}
                required
              />
            </div>
          </div>
          
          <div className="form-check mt-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="agreement"
              checked={placeOrderState.agreement}
              onChange={handleAgreementChange}
              disabled={isProcessing}
              required
            />
            <label className="form-check-label" htmlFor="agreement">
              Согласен с условиями обработки персональных данных *
            </label>
          </div>
          
          <div className="mt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canSubmit || isSubmitted}
              loading={isProcessing}
            >
              {isProcessing ? MESSAGES.ORDER_PROCESSING : `Оформить заказ на ${formatPrice(orderSummary.totalPrice)}`}
            </Button>
          </div>
        </form>
      )}
      
      {/* Состояние обработки */}
      {orderStep === 'processing' && (
        <div className="order-processing text-center py-5">
          <Loader size="lg" text={MESSAGES.ORDER_PROCESSING} />
          <p className="text-muted mt-3">
            Пожалуйста, дождитесь завершения обработки заказа
          </p>
        </div>
      )}
      
      {/* Успешное оформление */}
      {orderStep === 'success' && (
        <div className="order-success text-center py-5">
          <div className="success-icon mb-3">
            <span className="display-1">✅</span>
          </div>
          <h3 className="text-success">{MESSAGES.ORDER_SUCCESS}</h3>
          <p className="text-muted">
            Номер заказа: <strong>#{lastOrderId}</strong>
          </p>
          <p>Мы свяжемся с вами в ближайшее время для подтверждения заказа</p>
          
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.HOME)}
              className="me-2"
            >
              На главную
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.CATALOG)}
            >
              Продолжить покупки
            </Button>
          </div>
          
          {autoRedirect && (
            <p className="text-muted mt-3">
              <small>Автоматическое перенаправление через {Math.ceil(redirectDelay / 1000)} сек.</small>
            </p>
          )}
        </div>
      )}
      
      {/* Ошибка оформления */}
      {orderStep === 'error' && (
        <div className="order-error">
          <ErrorMessage 
            message={orderError || 'Произошла ошибка при оформлении заказа'}
            variant="alert"
          />
          
          <div className="mt-3">
            {canRetry && (
              <Button
                variant="secondary"
                onClick={handleRetry}
                disabled={isProcessing}
                loading={isProcessing}
                className="me-2"
              >
                Повторить попытку
              </Button>
            )}
            
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={isProcessing}
            >
              Изменить данные
            </Button>
          </div>
        </div>
      )}
      
      {/* Общий индикатор загрузки */}
      {isOrderLoading && orderStep !== 'processing' && (
        <div className="position-relative">
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
            <Loader text="Обработка заказа..." />
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент для отображения детальной информации о заказе
export interface OrderSummaryProps {
  className?: string;
  showEditButton?: boolean;
  onEdit?: (() => void) | undefined;
}

export const OrderSummary = ({
  className = '',
  showEditButton = false,
  onEdit
}: OrderSummaryProps) => {
  const [orderSummary] = useAtom(orderSummaryAtom);
  const [orderForm] = useAtom(orderFormSelector);
  
  if (orderSummary.isEmpty) {
    return null;
  }
  
  return (
    <div className={`order-summary-detailed ${className}`}>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Детали заказа</h6>
          {showEditButton && onEdit && (
            <Button variant="link" size="sm" onClick={onEdit}>
              Изменить
            </Button>
          )}
        </div>
        
        <div className="card-body">
          {/* Товары */}
          <div className="order-items mb-3">
            <h6>Товары ({orderSummary.itemsCount}):</h6>
            {orderSummary.items.map((item, index) => (
              <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <span className="fw-semibold">{item.title}</span>
                  <small className="text-muted ms-2">Размер: {item.size}</small>
                  <small className="text-muted ms-2">×{item.count}</small>
                </div>
                <span>{formatPrice(item.price * item.count)}</span>
              </div>
            ))}
          </div>
          
          {/* Контактные данные */}
          <div className="order-contact mb-3">
            <h6>Контактные данные:</h6>
            <p className="mb-1">
              <strong>Телефон:</strong> {orderForm.phone || 'Не указан'}
            </p>
            <p className="mb-0">
              <strong>Адрес:</strong> {orderForm.address || 'Не указан'}
            </p>
          </div>
          
          {/* Итого */}
          <div className="order-total pt-3 border-top">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Итого:</h5>
              <h5 className="mb-0 text-success">{formatPrice(orderSummary.totalPrice)}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Минимальная форма заказа без дополнительного функционала
export interface QuickOrderFormProps {
  className?: string;
  onSuccess: (orderId: string) => void;
  onError?: ((error: string) => void) | undefined;
}

export const QuickOrderForm = ({
  className = '',
  onSuccess,
  onError
}: QuickOrderFormProps) => {
  const [orderForm] = useAtom(orderFormSelector);
  const [canSubmit] = useAtom(canSubmitOrderAtom);
  const [isProcessing] = useAtom(isOrderProcessingAtom);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await submitOrderAction(ctx);
      if (result.success && result.orderId) {
        onSuccess(result.orderId);
      } else if (onError) {
        onError(result.error || 'Ошибка оформления заказа');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      if (onError) {
        onError('Произошла непредвиденная ошибка');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`quick-order-form ${className}`}>
      <div className="row g-2">
        <div className="col-md-4">
          <Input
            type="tel"
            value={orderForm.phone}
            onChange={(e) => updateOrderFieldAction(ctx, 'phone', e.target.value)}
            placeholder="Телефон"
            disabled={isProcessing}
            required
          />
        </div>
        
        <div className="col-md-6">
          <Input
            type="text"
            value={orderForm.address}
            onChange={(e) => updateOrderFieldAction(ctx, 'address', e.target.value)}
            placeholder="Адрес доставки"
            disabled={isProcessing}
            required
          />
        </div>
        
        <div className="col-md-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!canSubmit}
            loading={isProcessing}
          >
            Заказать
          </Button>
        </div>
      </div>
    </form>
  );
};