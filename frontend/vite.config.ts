import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const isDev = command === 'serve';
  const isProd = command === 'build';

  const API_BASE_URL = isProd 
    ? (env.VITE_PROD_API_BASE_URL || 'https://react-diploma-backend-x0qm.onrender.com/')
    : (env.VITE_API_BASE_URL || 'http://localhost:7070');

  const BASE_URL = isProd
    ? (env.VITE_PROD_BASE_URL || '/React-diploma/')
    : (env.VITE_BASE_URL || '/');

  // eslint-disable-next-line no-console
  console.log(`🔧 Vite Config:`, {
    mode,
    command,
    API_BASE_URL,
    BASE_URL,
    isDev,
    isProd
  });

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      svgr({
        svgrOptions: {
          exportType: 'default',
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: '**/*.svg',
      }),
    ],

    publicDir: 'public',
    base: BASE_URL,

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@/app': resolve(__dirname, './src/app'),
        '@/pages': resolve(__dirname, './src/pages'),
        '@/widgets': resolve(__dirname, './src/widgets'),
        '@/features': resolve(__dirname, './src/features'),
        '@/entities': resolve(__dirname, './src/entities'),
        '@/shared': resolve(__dirname, './src/shared'),
        '@/shared/ui': resolve(__dirname, './src/shared/ui'),
        '@/shared/lib': resolve(__dirname, './src/shared/lib'),
        '@/shared/config': resolve(__dirname, './src/shared/config'),
        '@/shared/store': resolve(__dirname, './src/shared/store'),
        '@/assets': resolve(__dirname, './src/assets'),
      },
    },

    server: {
      port: 3000,
      host: '0.0.0.0',
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },

    preview: {
      port: 4173,
      host: '0.0.0.0',
      open: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: isProd ? 'esbuild' : false,
      target: 'esnext',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
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
              '@reatom/undo',
            ],
            'validation': ['zod'],
            'utils': ['clsx'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? '';
            if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
              return 'assets/img/[name]-[hash][extname]';
            }
            if (/\.(css)$/i.test(name)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[ext]/[name]-[hash][extname]';
          },
        },
      },
    },

    define: {
      __API_BASE_URL__: JSON.stringify(API_BASE_URL),
      __DEV__: JSON.stringify(isDev),
      __PROD__: JSON.stringify(isProd),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION ?? '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    envPrefix: ['VITE_'],

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reatom/core',
        '@reatom/npm-react',
        '@reatom/persist-web-storage',
        'zod',
      ],
      exclude: [],
    },

    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDev
          ? '[name]__[local]___[hash:base64:5]'
          : '[hash:base64:8]',
      },
    },

    logLevel: isDev ? 'info' : 'warn',
    clearScreen: false,
  };
});