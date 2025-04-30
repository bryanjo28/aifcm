const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  note: { type: String },

  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'paid' },
  paidAt: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
