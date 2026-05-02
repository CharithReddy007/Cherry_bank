const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { generateOTP, sendOTP } = require('../middleware/otp');

// Get transactions for user
router.get('/', auth, async (req, res) => {
  try {
    const { accountId, type, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };
    if (accountId) filter.$or = [{ fromAccount: accountId }, { toAccount: accountId }];
    if (type && type !== 'all') filter.type = type;
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ transactions, total, pages: Math.ceil(total / limit), page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request OTP for high-value transfer
router.post('/request-transfer-otp', auth, async (req, res) => {
  try {
    const otp = generateOTP();
    req.user.otp = otp;
    req.user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await User.findByIdAndUpdate(req.user._id, { otp, otpExpiry: req.user.otpExpiry });
    await sendOTP(req.user.email, otp);
    res.json({ message: 'OTP sent', demoOtp: otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Execute transfer
router.post('/transfer', auth, async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description, otp } = req.body;
    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    // OTP required for transfers >= $1000
    if (transferAmount >= 1000) {
      const user = await User.findById(req.user._id);
      if (!user.otp || user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
      if (user.otpExpiry < new Date()) return res.status(400).json({ error: 'OTP expired' });
      await User.findByIdAndUpdate(req.user._id, { otp: null, otpExpiry: null });
    }

    const fromAccount = await Account.findOne({ _id: fromAccountId, userId: req.user._id });
    if (!fromAccount) return res.status(404).json({ error: 'Source account not found' });
    if (fromAccount.status === 'frozen') return res.status(400).json({ error: 'Account is frozen' });
    if (fromAccount.balance < transferAmount) return res.status(400).json({ error: 'Insufficient funds' });

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
    if (!toAccount) return res.status(404).json({ error: 'Destination account not found' });
    if (toAccount.status === 'frozen') return res.status(400).json({ error: 'Destination account is frozen' });

    // Fraud checks
    let flagged = false;
    let flagReason = '';
    if (transferAmount > 10000) { flagged = true; flagReason = 'Amount exceeds $10,000'; }
    
    // Check velocity: more than 5 transfers in 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await Transaction.countDocuments({ fromAccount: fromAccountId, createdAt: { $gte: oneHourAgo } });
    if (recentCount >= 5) { flagged = true; flagReason = (flagReason ? flagReason + '; ' : '') + 'High velocity transfers'; }

    // Execute
    fromAccount.balance -= transferAmount;
    toAccount.balance += transferAmount;
    await fromAccount.save();
    await toAccount.save();

    const toUser = await User.findById(toAccount.userId);

    const debitTx = await Transaction.create({
      fromAccount: fromAccount._id,
      toAccount: toAccount._id,
      fromAccountNumber: fromAccount.accountNumber,
      toAccountNumber: toAccount.accountNumber,
      userId: req.user._id,
      type: 'debit',
      amount: transferAmount,
      description,
      counterparty: toUser?.fullName || toAccount.accountNumber,
      balanceAfter: fromAccount.balance,
      flagged,
      flagReason
    });

    if (toAccount.userId.toString() !== req.user._id.toString()) {
      await Transaction.create({
        fromAccount: fromAccount._id,
        toAccount: toAccount._id,
        fromAccountNumber: fromAccount.accountNumber,
        toAccountNumber: toAccount.accountNumber,
        userId: toAccount.userId,
        type: 'credit',
        amount: transferAmount,
        description,
        counterparty: req.user.fullName,
        balanceAfter: toAccount.balance,
        flagged,
        flagReason
      });
    }

    res.json({ transaction: debitTx, newBalance: fromAccount.balance, flagged, flagReason });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
