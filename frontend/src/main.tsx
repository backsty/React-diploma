import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary, ReatomProvider, RouterProvider } from '@/app/providers';
import { App } from '@/app';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <ReatomProvider>
        <RouterProvider>
          <App />
        </RouterProvider>
      </ReatomProvider>
    </ErrorBoundary>
  </StrictMode>
);