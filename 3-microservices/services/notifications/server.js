require('dotenv').config(); // Load environment variables

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const nodemailer = require('nodemailer');

const app = new Koa();
const router = new Router();

// Configure SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use `true` for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send emails
async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: `"Notification Service" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

router.get('/health', async (ctx) => {
  ctx.status = 200;
  ctx.body = { status: 'Healthy' };
});

// API Route to send emails
router.post('/api/notify', async (ctx) => {
  const { to, subject, message } = ctx.request.body;

  if (!to || !subject || !message) {
    ctx.status = 400;
    ctx.body = { error: "Missing required fields" };
    return;
  }

  await sendEmail(to, subject, message);
  ctx.body = { success: true, message: "Email sent" };
});

// Middleware setup
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Notification Service running on http://localhost:${PORT}`));
