require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Local dev origins always allowed. Add your deployed frontend URL(s) via the
// FRONTEND_ORIGINS env var (comma-separated), e.g.:
// FRONTEND_ORIGINS=https://cherry-bank.vercel.app
const defaultOrigins = ['http://localhost:3000'];
const extraOrigins = (process.env.FRONTEND_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({ origin: [...defaultOrigins, ...extraOrigins], credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/statements', require('./routes/statements'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/securebank')
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Seed admin user if none exists
    const User = require('./models/User');
    const existing = await User.findOne({ email: 'admin@securebank.com' });
    if (!existing) {
      await User.create({ fullName: 'Admin', email: 'admin@securebank.com', password: 'Admin@12345', role: 'admin' });
      console.log('🌱 Admin seeded: admin@securebank.com / Admin@12345');
    }

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🏦 SecureBank server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
