const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

const app = new Koa();
const router = new Router();

const DB_PATH = path.join(__dirname, '../db.json');

// Path to logging file
const LOG_FILE_PATH = path.join('..', 'logging', 'db.json');
console.log("Log file path:", LOG_FILE_PATH); 

const logRequest = (ctx) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url,
    headers: ctx.headers,
    ip: ctx.ip,
    status: ctx.status,
  };

  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE_PATH)) {
      const data = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      logs = data ? JSON.parse(data) : [];
    }
    logs.push(logEntry);
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
};

app.use(async (ctx, next) => {
  await next();
  logRequest(ctx);
});

// Get all users
router.get('/api/users', async (ctx) => {
  ctx.body = db.users;
});

// Get a user by ID
router.get('/api/users/:id', async (ctx) => {
  const userId = parseInt(ctx.params.id);
  const user = db.users.find((u) => u.id === userId);

  if (user) {
    ctx.body = user;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3002;
app.listen(PORT, () => console.log(`Users service running on port ${PORT}`));
