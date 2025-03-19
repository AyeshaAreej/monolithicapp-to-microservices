const Koa = require('koa');
const Router = require('koa-router');
const db = require('./db.json');

const app = new Koa();
const router = new Router();

// Middleware to log requests
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// Route: Get posts in a specific thread
router.get('/api/posts/in-thread/:threadId', async (ctx) => {
  const id = parseInt(ctx.params.threadId);
  ctx.body = db.posts.filter((post) => post.thread === id);
});

// Route: Get all posts
router.get('/api/posts', async (ctx) => {
  ctx.body = db.posts;
});

// Route: Get posts by a specific user
router.get('/api/posts/:userId', async (ctx) => {
  const id = parseInt(ctx.params.userId);
  ctx.body = db.posts.filter((post) => post.user === id);
});

// Root API health check
router.get('/api/', async (ctx) => {
  ctx.body = "API ready to receive requests";
});

// Root route
router.get('/', async (ctx) => {
  ctx.body = "Ready to receive requests";
});

// Apply routes and methods
app.use(router.routes()).use(router.allowedMethods());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
