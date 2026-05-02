const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  fromAccountNumber: { type: String },
  toAccountNumber: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit', 'deposit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  counterparty: { type: String },
  balanceAfter: { type: Number },
  flagged: { type: Boolean, default: false },
  flagReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
