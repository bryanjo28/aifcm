const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. "DISKON50"
  type: { type: String, enum: ['percentage', 'fixed'], required: true }, // diskon %
  value: { type: Number, required: true }, // contoh: 50 = 50% atau 50000
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voucher', voucherSchema);
