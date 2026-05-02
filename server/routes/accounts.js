const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Get all accounts for user
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Open new account
router.post('/', auth, async (req, res) => {
  try {
    const { type, initialDeposit } = req.body;
    if (!['savings', 'current'].includes(type)) return res.status(400).json({ error: 'Invalid account type' });
    const deposit = parseFloat(initialDeposit) || 0;
    const account = await Account.create({ userId: req.user._id, type, balance: deposit });
    if (deposit > 0) {
      await Transaction.create({
        toAccount: account._id,
        toAccountNumber: account.accountNumber,
        userId: req.user._id,
        type: 'deposit',
        amount: deposit,
        description: 'Initial deposit',
        counterparty: 'SecureBank',
        balanceAfter: deposit
      });
    }
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
