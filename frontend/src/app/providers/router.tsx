import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

interface RouterProviderProps {
  children: ReactNode;
}

export const RouterProvider = ({ children }: RouterProviderProps) => {
  const basename = import.meta.env.PROD 
    ? import.meta.env.VITE_PROD_BASE_URL || '/React-diploma/'
    : import.meta.env.VITE_BASE_URL || '/';

  return (
    <BrowserRouter basename={basename}>
      {children}
    </BrowserRouter>
  );
};