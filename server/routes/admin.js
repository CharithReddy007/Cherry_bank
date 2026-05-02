const router = require('express').Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Get all flagged transactions
router.get('/flagged', adminAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ flagged: true })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Freeze/unfreeze account
router.patch('/accounts/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const account = await Account.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats overview
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [users, accounts, transactions, flagged] = await Promise.all([
      User.countDocuments(),
      Account.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ flagged: true })
    ]);
    res.json({ users, accounts, transactions, flagged });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
