
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const axios = require('axios'); // Import axios for API requests
const db = require('./db.json');

const app = new Koa();
const router = new Router();

// Email Microservice Base URL (Replace with actual AWS URL)
const EMAIL_MICROSERVICE_URL = "http://notifi-Publi-bRvo70paHthM-569285455.us-west-2.elb.amazonaws.com/api/notify";

// Middleware for logging requests
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});


// Get all users
router.get('/api/users', async (ctx) => {
  ctx.body = db.users;
});

// Get user by ID and send email using the notification microservice
router.get('/api/users/:userId', async (ctx) => {
  const id = parseInt(ctx.params.userId);
  const user = db.users.find((user) => user.id === id);

  if (!user) {
    ctx.status = 404;
    ctx.body = { error: "User not found" };
    return;
  }

  // Email content
  const emailData = {
    to: user.email,
    subject: "Welcome to Our Website 🎉",
    message: `Hello ${user.name},\n\nWelcome to our website! We are excited to invite you to our special event. Stay tuned for more details!\n\nBest Regards,\nThe Event Team`
  };

  try {
    // Call the email notification microservice
    const response = await axios.post(EMAIL_MICROSERVICE_URL, emailData);
    console.log(`Email sent to ${user.email}:`, response.data);

    ctx.body = {
      message: `User found and email sent via notification service`,
      user,
      email_status: response.data
    };
  } catch (error) {
    console.error("Error sending email via notification service:", error.message);
    ctx.status = 500;
    ctx.body = { error: "Failed to send email", details: error.message };
  }
});

// API readiness check
router.get('/api/', async (ctx) => {
  ctx.body = "API ready to receive requests";
});

router.get('/', async (ctx) => {
  ctx.body = "Ready to receive requests";
});

// Apply routes
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
