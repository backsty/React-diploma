import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
const { randomInt } = await import('node:crypto');
import { setTimeout } from 'node:timers/promises';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoriesPath = path.join(__dirname, 'data', 'categories.json');
const productsPath = path.join(__dirname, 'data', 'products.json');

const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
const items = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

const topSaleIds = [66, 65, 73];
const moreCount = 6;

const itemBasicMapper = item => ({
  id: item.id,
  category: item.category,
  title: item.title,
  price: item.price,
  images: item.images,
});

const config = {
  delay: process.env.APP_DELAY === 'true',
  error: process.env.APP_ERROR === 'true',
};

const parseRequestBody = req => {
  return new Promise(resolve => {
    let body = [];
    req
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        resolve(JSON.parse(body));
      });
  });
};

const setCorsHeaders = res => {
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://backsty.github.io',
          'https://react-diploma-backend.onrender.com',
        ]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  res.setHeader('Access-Control-Allow-Origin', '*'); // Для простоты, в продакшене лучше конкретные домены
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
};

const handleOptionsRequest = (req, res) => {
  setCorsHeaders(res);
  res.writeHead(200);
  res.end();
};

const sendResponse = (res, statusCode, data = null) => {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  if (statusCode === 204) {
    res.end();
  } else {
    res.end(JSON.stringify(data));
  }
};

const createServer = (port = 7070) => {
  const server = http.createServer(async (req, res) => {
    // Добавляем задержку если нужно
    if (config.delay) {
      await setTimeout(randomInt(1000, 3000));
    }

    if (req.method === 'OPTIONS') {
      return handleOptionsRequest(req, res);
    }

    if (config.error && Math.random() > 0.8) {
      return sendResponse(res, 500, { error: 'Internal server error' });
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    try {
      // Health check
      if (pathname === '/health' && req.method === 'GET') {
        return sendResponse(res, 200, {
          status: 'ok',
          timestamp: new Date().toISOString(),
          env: process.env.NODE_ENV || 'development',
        });
      }

      // Маршруты
      if (pathname === '/' && req.method === 'GET') {
        return sendResponse(res, 200, {
          message: 'React Diploma API server is running',
          version: '1.0.0',
          endpoints: [
            '/api/top-sales',
            '/api/categories',
            '/api/items',
            '/api/items/:id',
            '/api/order',
          ],
        });
      }

      if (pathname === '/api/top-sales' && req.method === 'GET') {
        const topSales = items
          .filter(o => topSaleIds.includes(o.id))
          .map(itemBasicMapper);
        return sendResponse(res, 200, topSales);
      }

      if (pathname === '/api/categories' && req.method === 'GET') {
        return sendResponse(res, 200, categories);
      }

      if (pathname === '/api/items' && req.method === 'GET') {
        const categoryId = Number(query.categoryId || 0);
        const offset = Number(query.offset || 0);
        const q = (query.q || '').trim().toLowerCase();

        console.log('API /items запрос:', { categoryId, offset, q, query });

        let filtered = [...items];

        // Фильтр по категории
        if (categoryId > 0) {
          filtered = filtered.filter(item => item.category === categoryId);
          console.log(
            `Фильтр по категории ${categoryId}:`,
            filtered.length,
            'товаров',
          );
        }

        // Фильтр по поисковому запросу
        if (q) {
          filtered = filtered.filter(item => {
            const title = (item.title || '').toLowerCase();
            const color = (item.color || '').toLowerCase();
            const manufacturer = (item.manufacturer || '').toLowerCase();
            const material = (item.material || '').toLowerCase();

            const colorMatch = color === q;
            const titleMatch = title.includes(q);
            const manufacturerMatch = manufacturer.includes(q);
            const materialMatch = material.includes(q);

            return (
              colorMatch || titleMatch || manufacturerMatch || materialMatch
            );
          });
          console.log(`Фильтр по поиску "${q}":`, filtered.length, 'товаров');
        }

        // Пагинация
        const paginatedItems = filtered
          .slice(offset, offset + moreCount)
          .map(itemBasicMapper);

        console.log(
          `Отправляем ${paginatedItems.length} товаров (offset: ${offset}, total: ${filtered.length})`,
        );

        return sendResponse(res, 200, paginatedItems);
      }

      if (pathname.match(/^\/api\/items\/\d+$/) && req.method === 'GET') {
        const id = Number(pathname.split('/')[3]);
        const item = items.find(o => o.id === id);
        return item
          ? sendResponse(res, 200, item)
          : sendResponse(res, 404, { error: 'Item not found' });
      }

      if (pathname === '/api/order' && req.method === 'POST') {
        const body = await parseRequestBody(req);

        const { owner = {}, items: orderItems = [] } = body;
        const { phone, address } = owner;

        if (typeof phone !== 'string' || typeof address !== 'string') {
          return sendResponse(res, 400, { error: 'Invalid owner data' });
        }

        if (
          !Array.isArray(orderItems) ||
          !orderItems.every(
            item =>
              typeof item.id === 'number' &&
              typeof item.price === 'number' &&
              typeof item.count === 'number',
          )
        ) {
          return sendResponse(res, 400, { error: 'Invalid items format' });
        }

        console.log('📦 Заказ создан:', {
          phone,
          address,
          itemsCount: orderItems.length,
        });
        return sendResponse(res, 204);
      }

      sendResponse(res, 404, { error: 'Endpoint not found' });
    } catch (error) {
      console.error('Server error:', error);
      sendResponse(res, 500, { error: 'Internal server error' });
    }
  });

  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(
      `🔧 CORS origin: ${process.env.CORS_ORIGIN || 'localhost:3000'}`,
    );
  });

  return server;
};

export { createServer };
