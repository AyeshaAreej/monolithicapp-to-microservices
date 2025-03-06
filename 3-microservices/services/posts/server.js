const Koa = require('koa');
const Router = require('koa-router');
const fs = require('fs');
const path = require('path');
const axios = require("axios");

// Load database (db.json)
const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

const app = new Koa();
const router = new Router();

// Path to logging file
const LOG_FILE_PATH = path.join('..', 'logging', 'db.json');
console.log("Log file path:", LOG_FILE_PATH); 
// Function to append log entry
// const logRequest = async (ctx) => {
//   const logEntry = {
//     timestamp: new Date().toISOString(),
//     method: ctx.method,
//     url: ctx.url,
//     ip: ctx.ip, // User IP Address
//     status: ctx.status, // Response status code
//   };

//   try {
//     let logsData = { logs: [] }; // Default structure

//     // Read existing logs
//     if (fs.existsSync(LOG_FILE_PATH)) {
//       const data = fs.readFileSync(LOG_FILE_PATH, 'utf8').trim();
//       if (data) {
//         const parsedData = JSON.parse(data);
//         if (parsedData.logs && Array.isArray(parsedData.logs)) {
//           logsData = parsedData;
//         } else {
//           console.warn("⚠ Log file structure incorrect. Resetting...");
//         }
//       }
//     }

//     // Append new log entry to logs array
//     logsData.logs.push(logEntry);

//     console.log("✅ Appending log entry:", logEntry);

//     // Write updated log back to the file
//     fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logsData, null, 2), 'utf8');
//   } catch (error) {
//     console.error('Error writing to log file:', error);
//   }
// };


const logRequest = async (ctx) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: ctx.method,
    url: ctx.url,
    ip: ctx.ip,
    status: ctx.status,
    level: "info", // Add default level
    message: `Request received: ${ctx.method} ${ctx.url}` // Add message
  };

  try {
    await axios.post(
      "http://my-ecs-publi-cn4bwsi7eikn-1658902000.us-east-1.elb.amazonaws.com/api/logs/",
      logEntry
    );
    console.log("✅ Log sent successfully:", logEntry);
  } catch (error) {
    console.error("❌ Failed to send log:", error.message);
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
  console.log('Inside get all posts');
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
