require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

let dbConnected = false;

const connectOnce = async () => {
  if (!dbConnected) {
    try {
      console.log('Connecting to database...');
      await connectDB();
      dbConnected = true;

      if (process.env.SEED_ON_START === 'true') {
        const seed = require('./seed');
        await seed();
      }
    } catch (err) {
      dbConnected = false;
      throw err;
    }
  }
};

app.use(cors());
app.use(express.json());

// Ensure DB connected before any route
app.use(async (req, res, next) => {
  try {
    await connectOnce();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Service unavailable' });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payos', require('./routes/payos'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production' && !process.env.LAMBDA_TASK_ROOT && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectOnce()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch(err => {
      console.error(err.message);
      process.exit(1);
    });
}
