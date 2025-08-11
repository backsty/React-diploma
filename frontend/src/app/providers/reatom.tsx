import { ReactNode } from 'react';
import { reatomContext } from '@reatom/npm-react';
import { ctx, initPersistence } from '@/shared/store';

interface ReatomProviderProps {
  children: ReactNode;
}

export const ReatomProvider = ({ children }: ReatomProviderProps) => {
  // Инициализируем персистентность при создании провайдера
  initPersistence();
  
  return (
    <reatomContext.Provider value={ctx}>
      {children}
    </reatomContext.Provider>
  );
};