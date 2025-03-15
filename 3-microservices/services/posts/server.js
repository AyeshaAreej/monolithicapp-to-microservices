const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const bodyParser = require('koa-bodyparser');
// const express = require("express");



// 1) Winston + CloudWatch
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

// Create a Winston logger that includes a Console transport
// plus a CloudWatch transport pointing to your log group.
const logger = winston.createLogger({
  transports: [
    // (Optional) Console transport for local debugging
    new winston.transports.Console(),

    // CloudWatch transport (use WinstonCloudWatch, not winston.transports.Cloudwatch)
    new WinstonCloudWatch({
      logGroupName: '/ecs/logging-service-task',  // Your log group
      logStreamName: 'my-stream-name',            // Any stream name you like
      awsRegion: 'us-west-2',                    // Must match your CloudWatch region
      jsonMessage: true                          // Sends logs in JSON format
      // If running locally, set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY
      // or have credentials in ~/.aws/credentials.
    })
  ]
});

// 2) Load "Posts" data from a local db.json file (example)
const POSTS_DB_PATH = path.join(__dirname, 'db.json');
const db = fs.existsSync(POSTS_DB_PATH)
  ? JSON.parse(fs.readFileSync(POSTS_DB_PATH, 'utf8'))
  : { posts: [] };

// 3) Koa app + router
const app = new Koa();
const router = new Router();

// Helper function to log a request
function logRequest(ctx) {
  // Build your structured log object
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url,
    ip: ctx.ip,
    status: ctx.status
  };

  // Send the log to CloudWatch (and console, if you want)
  logger.info('Request Log', logEntry);
}

// Logging Middleware: runs after each request
app.use(async (ctx, next) => {
  // Process the request
  const startTime = Date.now();
  await next();
  const durationMs = Date.now() - startTime;

  // Optional console log for local debugging
  console.log(`${ctx.method} ${ctx.url} - ${durationMs}ms`);

  // Log to CloudWatch
  logRequest(ctx);
});

// Example routes
// router.get('/api/posts', (ctx) => {
//   ctx.body = db.posts;
//   console.log('Fetched all posts');
// });
app.get('/api/posts', (ctx) => {
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

// 4) Start the server
const PORT = 3006;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

