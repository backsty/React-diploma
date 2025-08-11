import { ReactNode } from 'react';
import clsx from 'clsx';

export interface LayoutProps {
  children: ReactNode;
  className?: string;
  container?: boolean;
  fluid?: boolean;
}

export const Layout = ({ 
  children, 
  className, 
  container = true,
  fluid = false 
}: LayoutProps) => {
  if (!container) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={clsx(
      fluid ? 'container-fluid' : 'container',
      className
    )}>
      {children}
    </div>
  );
};

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export const PageLayout = ({ children, className }: PageLayoutProps) => {
  return (
    <div className={clsx('min-vh-100 d-flex flex-column', className)}>
      {children}
    </div>
  );
};

export interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  return (
    <main className={clsx('flex-grow-1', className)}>
      <Layout>
        {children}
      </Layout>
    </main>
  );
};