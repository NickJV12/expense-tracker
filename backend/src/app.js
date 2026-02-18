require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const expenseRoutes = require('./routes/expenses');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',                    // local Vite dev server
    process.env.FRONTEND_URL,                  // your Vercel URL (set in env vars)
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Idempotency-Key'],
}));
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/expenses', expenseRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Root route ─────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: 'Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      health:   'GET  /health',
      expenses: 'GET  /expenses',
      create:   'POST /expenses',
    },
  });
});

// ── Error handler ──────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Connect DB then start server ───────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });