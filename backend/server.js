require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payos', require('./routes/payos'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error('=== ERROR DETAILS ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Code:', err.code);
  console.error('====================');
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Database connection (called once on startup)
let dbConnected = false;

const connectOnce = async () => {
  if (!dbConnected) {
    try {
      await connectDB();
      console.log('Database connected successfully');
      dbConnected = true;
      
      if (process.env.SEED_ON_START === 'true') {
        console.log('Starting seed process...');
        const seed = require('./seed');
        await seed();
        console.log('Seed completed');
      }
    } catch (err) {
      console.error('Failed to connect database:', err.message);
      dbConnected = false;
      throw err;
    }
  }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    await connectOnce();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Service unavailable' });
  }
});

// Export app for serverless platforms
module.exports = app;

// For local development: start server if not in serverless environment
if (process.env.NODE_ENV !== 'production' && !process.env.LAMBDA_TASK_ROOT && !process.env.VERCEL) {
  const start = async () => {
    try {
      await connectOnce();
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    }
  };
  
  start();
}
