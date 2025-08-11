import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageLayout } from '@/shared/ui';
import { getPageTitle } from '@/shared/config';
import { Header, Footer } from '@/widgets';
import { initCartAction } from '@/entities/cart';
import { ctx } from '@/shared/store';
import { AppRoutes } from './router';

import './styles/index.css';

export const App = () => {
  const location = useLocation();

  // Обновляем title страницы при изменении роута
  useEffect(() => {
    const title = getPageTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);

  // Инициализируем корзину при запуске приложения
  useEffect(() => {
    initCartAction(ctx);
  }, []);

  return (
    <PageLayout className="page-transition">
      <Header />
      
      <main className="flex-grow-1">
        <AppRoutes />
      </main>
      
      <Footer />
    </PageLayout>
  );
};