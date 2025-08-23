import { createServer } from 'http';
import { parse } from 'url';
import { Database } from './database.js';

const db = new Database();
const PORT = process.env.PORT || 3000;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  const { pathname, query } = parse(req.url, true);
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  try {
    if (pathname === '/todos') {
      if (method === 'GET') {
        const todos = await db.getTodos();
        sendJSON(res, todos);
      } else if (method === 'POST') {
        const body = await parseBody(req);
        if (!body.title) {
          sendJSON(res, { error: 'Title is required' }, 400);
          return;
        }
        const todo = await db.createTodo(body.title, body.description);
        sendJSON(res, todo, 201);
      } else {
        sendJSON(res, { error: 'Method not allowed' }, 405);
      }
    } else if (pathname.startsWith('/todos/')) {
      const id = parseInt(pathname.split('/')[2]);
      
      if (isNaN(id)) {
        sendJSON(res, { error: 'Invalid todo ID' }, 400);
        return;
      }

      if (method === 'GET') {
        const todo = await db.getTodoById(id);
        if (!todo) {
          sendJSON(res, { error: 'Todo not found' }, 404);
          return;
        }
        sendJSON(res, todo);
      } else if (method === 'PUT') {
        const body = await parseBody(req);
        const todo = await db.updateTodo(id, body);
        if (!todo) {
          sendJSON(res, { error: 'Todo not found' }, 404);
          return;
        }
        sendJSON(res, todo);
      } else if (method === 'DELETE') {
        const deleted = await db.deleteTodo(id);
        if (!deleted) {
          sendJSON(res, { error: 'Todo not found' }, 404);
          return;
        }
        sendJSON(res, { message: 'Todo deleted' });
      } else {
        sendJSON(res, { error: 'Method not allowed' }, 405);
      }
    } else {
      sendJSON(res, { error: 'Not found' }, 404);
    }
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, { error: 'Internal server error' }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`TODO API server running on port ${PORT}`);
});

process.on('SIGINT', () => {
  db.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { server, db };