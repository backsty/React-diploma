import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = command === 'serve';
  const isProd = command === 'build';

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic'
      })
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@/components': resolve(__dirname, './src/components'),
        '@/pages': resolve(__dirname, './src/pages'),
        '@/store': resolve(__dirname, './src/store'),
        '@/types': resolve(__dirname, './src/types'),
        '@/services': resolve(__dirname, './src/services'),
        '@/hooks': resolve(__dirname, './src/hooks'),
        '@/utils': resolve(__dirname, './src/utils'),
        '@/assets': resolve(__dirname, './src/assets'),
        '@/router': resolve(__dirname, './src/router'),
        '@/htmlTemplates': resolve(__dirname, './src/htmlTemplates')
      }
    },

    server: {
      port: 3000,
      host: '0.0.0.0',
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:7070',
          changeOrigin: true,
          secure: false
        }
      }
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'reatom': [
              '@reatom/core',
              '@reatom/npm-react',
              '@reatom/persist-web-storage',
              '@reatom/async',
              '@reatom/lens',
              '@reatom/logger',
              '@reatom/primitives',
              '@reatom/url',
              '@reatom/undo'
            ],
            'ui-libs': [
              'framer-motion',
              '@heroicons/react',
              'react-hot-toast',
              'react-image',
              'react-intersection-observer'
            ],
            'forms': [
              'react-hook-form',
              '@hookform/resolvers',
              'zod'
            ],
            'utils': [
              'clsx',
              '@tanstack/react-virtual',
              'crypto-js'
            ]
          }
        }
      }
    },

    define: {
      __API_BASE_URL__: JSON.stringify(
        isProd 
          ? env.VITE_PROD_API_BASE_URL || 'https://react-diploma-backend.onrender.com'
          : env.VITE_API_BASE_URL || 'http://localhost:7070'
      ),
      __DEV__: JSON.stringify(isDev),
      __PROD__: JSON.stringify(isProd),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    envPrefix: ['VITE_'],

    base: isProd 
      ? env.VITE_PROD_BASE_URL || '/React-diploma/'
      : env.VITE_BASE_URL || '/',

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reatom/core',
        '@reatom/npm-react',
        'clsx',
        'framer-motion'
      ]
    }
  };
});