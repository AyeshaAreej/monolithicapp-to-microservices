const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');

// Load database (db.json)
const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

const app = new Koa();
const router = new Router();

// Path to logging file
const LOG_FILE_PATH = path.join('..', 'logging', 'db.json');
console.log("Log file path:", LOG_FILE_PATH); 
// Function to append log entry
const logRequest = (ctx) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url,
    headers: ctx.headers, // Logs request headers
    ip: ctx.ip, // User IP Address
    status: ctx.status, // Response status code
  };

  try {
    // Read existing logs or initialize an array
    let logs = [];
    if (fs.existsSync(LOG_FILE_PATH)) {
      const data = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      logs = data ? JSON.parse(data) : [];
    }

    // Append new log entry
    logs.push(logEntry);

    // Write back to the log file
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
};

// Logging Middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);

  // Log request
  logRequest(ctx);
});

// Get all posts
router.get('/api/posts', async (ctx) => {
  ctx.body = db.posts;
});

// Get posts in a specific thread
router.get('/api/posts/:id', async (ctx) => {
  const postId = parseInt(ctx.params.id);
  const post = db.posts.find((p) => p.thread === postId); // Adjust if needed

  if (post) {
    ctx.body = post;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Post not found' };
  }
});

// Root API response
router.get('/api/', async (ctx) => {
  ctx.body = "API ready to receive requests";
});

// Root response
router.get('/', async (ctx) => {
  ctx.body = "Ready to receive requests";
});

// Apply routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
