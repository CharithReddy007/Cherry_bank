const mongoose = require('mongoose');

function generateAccountNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SB';
  for (let i = 0; i < 10; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, unique: true, default: generateAccountNumber },
  type: { type: String, enum: ['savings', 'current'], required: true },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'frozen'], default: 'active' },
  interestRate: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

accountSchema.pre('save', function (next) {
  if (!this.interestRate) {
    this.interestRate = this.type === 'savings' ? 2.4 : 0.1;
  }
  next();
});

module.exports = mongoose.model('Account', accountSchema);
