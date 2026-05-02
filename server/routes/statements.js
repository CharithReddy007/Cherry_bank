const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Get statement data for a month
router.get('/', auth, async (req, res) => {
  try {
    const { year, month, accountId } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const accounts = await Account.find({ userId: req.user._id });
    const filteredAccounts = accountId ? accounts.filter(a => a._id.toString() === accountId) : accounts;

    const statements = await Promise.all(filteredAccounts.map(async (acc) => {
      const transactions = await Transaction.find({
        userId: req.user._id,
        $or: [{ fromAccount: acc._id }, { toAccount: acc._id }],
        createdAt: { $gte: start, $lt: end }
      }).sort({ createdAt: 1 });

      const credits = transactions.filter(t => t.type === 'credit' || t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
      const debits = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

      return { account: acc, transactions, credits, debits };
    }));

    res.json({ statements, period: { year: y, month: m } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
