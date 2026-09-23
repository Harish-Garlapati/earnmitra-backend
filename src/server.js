require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const partnerRoutes = require('./routes/partners');
const leadRoutes = require('./routes/leads');
const payoutRoutes = require('./routes/payouts');
const supportRoutes = require('./routes/support');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');
const cibilReportRoutes = require('./routes/cibilReports');
const profilePhotoRoutes = require('./routes/profilePhoto');
const notificationRoutes = require('./routes/notifications');
const walletRoutes = require('./routes/wallet');
const webhookRoutes = require('./routes/webhooks');

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4201',
  'http://localhost:4202',
  'http://localhost:4300',
  'http://127.0.0.1:4200',
  'http://127.0.0.1:4201',
  'http://127.0.0.1:4202',
  'http://localhost',
  'capacitor://localhost',
  'https://earnmitra.in',
  'https://admin.earnmitra.in',
  'https://api.earnmitra.in',
  ...(process.env.ADMIN_CORS_ORIGINS ? process.env.ADMIN_CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : [])
];
// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

app.use(cors());

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf ? buf.toString('utf8') : '';
  }
}));
app.use(express.urlencoded({ extended: true }));

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

app.use('/api/health', healthRoutes);
app.use('/api/auth/admin/login', adminLoginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/partners/me/profile-photo', profilePhotoRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/cibil-reports', cibilReportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const payload = { error: err.message || 'Internal server error' };
  if (err.code) payload.code = err.code;
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
});

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection:', reason));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Earnmitra backend listening on http://localhost:${PORT}`));
}

module.exports = app;
