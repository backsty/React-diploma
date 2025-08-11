import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom } from '@reatom/npm-react';
import { Loader, ErrorMessage } from '@/shared/ui';
import { ROUTES } from '@/shared/config';
import { 
  ProductDetails, 
  ProductDetailsSkeleton,
  getProduct,
  setProductLoadingAction,
  setProductDataAction,
  setProductErrorAction,
  clearProductAction,
  currentProductAtom
} from '@/entities/product';
import { ctx } from '@/shared/store';

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productState] = useAtom(currentProductAtom);

  useEffect(() => {
    const loadProduct = async () => {
      // eslint-disable-next-line no-console
      console.log('📍 ProductPage: получен параметр id =', id);
      
      if (!id) {
        console.error('❌ ProductPage: параметр id отсутствует');
        navigate(ROUTES.NOT_FOUND);
        return;
      }

      // Проверяем что id содержит только цифры
      if (!/^\d+$/.test(id)) {
        console.error('❌ ProductPage: параметр id не является числом:', id);
        navigate(ROUTES.NOT_FOUND);
        return;
      }

      const productId = parseInt(id, 10);
      if (isNaN(productId) || productId <= 0) {
        console.error('❌ ProductPage: некорректный productId:', productId);
        navigate(ROUTES.NOT_FOUND);
        return;
      }

      // eslint-disable-next-line no-console
      console.log('✅ ProductPage: загружаем товар с ID:', productId);

      try {
        // Начинаем загрузку
        setProductLoadingAction(ctx, true);
        clearProductAction(ctx);

        // Загружаем товар
        const product = await getProduct(productId);
        // eslint-disable-next-line no-console
        console.log('✅ ProductPage: товар загружен:', product);
        setProductDataAction(ctx, product);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ошибка загрузки товара';
        console.error('❌ ProductPage: ошибка загрузки товара:', error);
        setProductErrorAction(ctx, errorMessage);
        
        // Если товар не найден (404), перенаправляем на 404
        if (errorMessage.includes('404') || errorMessage.includes('не найден')) {
          navigate(ROUTES.NOT_FOUND);
        }
      }
    };

    loadProduct();

    // Очистка при размонтировании
    return () => {
      clearProductAction(ctx);
    };
  }, [id, navigate]);

  // Состояние загрузки
  if (productState.isLoading && !productState.data) {
    return (
      <main className="container my-5">
        <ProductDetailsSkeleton />
      </main>
    );
  }

  // Состояние ошибки
  if (productState.error && !productState.data) {
    return (
      <main className="container my-5">
        <ErrorMessage 
          message={productState.error}
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  // Товар не найден
  if (!productState.data) {
    return (
      <main className="container my-5">
        <div className="text-center">
          <h2>Товар не найден</h2>
          <p>Возможно, товар был удален или перемещен</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(ROUTES.CATALOG)}
          >
            Перейти в каталог
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container my-5">
      {/* Навигация назад */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button 
              className="btn btn-link p-0"
              onClick={() => navigate(ROUTES.HOME)}
            >
              Главная
            </button>
          </li>
          <li className="breadcrumb-item">
            <button 
              className="btn btn-link p-0"
              onClick={() => navigate(ROUTES.CATALOG)}
            >
              Каталог
            </button>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {productState.data.title}
          </li>
        </ol>
      </nav>

      {/* Детали товара */}
      <ProductDetails 
        product={productState.data}
        onAddToCart={() => {
          // eslint-disable-next-line no-console
          console.log('Товар добавлен в корзину:', productState.data?.title);
        }}
      />

      {/* Индикатор загрузки при обновлении */}
      {productState.isLoading && productState.data && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded p-4">
            <Loader text="Обновление информации о товара..." />
          </div>
        </div>
      )}
    </main>
  );
};