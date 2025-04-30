const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },           // Nama produk
  slug: { type: String, required: true, unique: true }, // Untuk URL-friendly identifier
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },                       // URL gambar produk
  fileUrl: { type: String },                        // URL file produk (jika digital)
  isActive: { type: Boolean, default: true },       // Bisa dinonaktifkan
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
