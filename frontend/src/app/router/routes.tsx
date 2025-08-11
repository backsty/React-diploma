import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/shared/config';

import { HomePage } from '@/pages/home';
import { CatalogPage } from '@/pages/catalog';
import { ProductPage } from '@/pages/product';
import { CartPage } from '@/pages/cart';
import { AboutPage } from '@/pages/about';
import { ContactsPage } from '@/pages/contacts';
import { NotFoundPage } from '@/pages/not-found';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
      <Route path={ROUTES.PRODUCT} element={<ProductPage />} />
      <Route path={ROUTES.CART} element={<CartPage />} />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      <Route path={ROUTES.CONTACTS} element={<ContactsPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};