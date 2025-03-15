const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const bodyParser = require('koa-bodyparser');

const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new WinstonCloudWatch({
      logGroupName: '/ecs/logging-service-task',
      logStreamName: 'my-stream-name',
      awsRegion: 'us-west-2',
      jsonMessage: true,
    })
  ]
});

const POSTS_DB_PATH = path.join(__dirname, 'db.json');
const db = fs.existsSync(POSTS_DB_PATH)
  ? JSON.parse(fs.readFileSync(POSTS_DB_PATH, 'utf8'))
  : { posts: [] };

const app = new Koa();
const router = new Router();

function logRequest(ctx) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url,
    ip: ctx.ip,
    status: ctx.status
  };
  logger.info('Request Log', logEntry);
}

app.use(async (ctx, next) => {
  const startTime = Date.now();
  await next();
  const durationMs = Date.now() - startTime;
  console.log(`${ctx.method} ${ctx.url} - ${durationMs}ms`);
  logRequest(ctx);
});

router.get('/api/posts', (ctx) => {
  const { startTime, endTime } = ctx.query;
  let filteredPosts = db.posts;

  if (startTime && endTime) {
    filteredPosts = db.posts.filter(post => {
      const postTime = new Date(post.timestamp).getTime();
      return (
        postTime >= new Date(startTime).getTime() &&
        postTime <= new Date(endTime).getTime()
      );
    });
  }

  ctx.body = filteredPosts;
});

router.get('/api/posts/:id', (ctx) => {
  const postId = Number(ctx.params.id);
  const post = db.posts.find((p) => p.thread === postId);

  if (post) {
    ctx.body = post;
  } else {
    ctx.status = 404;
    ctx.body = { error: 'Post not found' };
  }
});

router.get('/api/', (ctx) => {
  ctx.body = 'API ready to receive requests';
});

router.get('/', (ctx) => {
  ctx.body = 'Ready to receive requests';
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
