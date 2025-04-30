const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Voucher = require('./models/Voucher');

const sendEmail = require('./utils/sendEmail');

dotenv.config();
const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});


// Middleware
app.use(express.json({ limit: '10mb' }));   // ⬅️ Penting!
app.use(express.urlencoded({ extended: true })); // untuk form post dari HTML

// Static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/checkout.html'));
});


//Simulasi Order
app.post('/api/orders', async (req, res) => {
    try {
      const order = new Order({
        ...req.body,
        paymentStatus: 'paid',
        paidAt: new Date()
      });
      await order.save();
  
      await sendEmail(order.email, order.productName, order.fileUrl); // ✅ Kirim email
  
      res.status(201).json({
        message: 'Order created',
        downloadLink: order.fileUrl
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Gagal membuat order' });
    }
  });



// Serve form tambah produk
app.get('/add-product', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/add-product.html'));
});

// Halaman list produk
app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/products.html'));
});

// API: ambil semua produk
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil produk' });
    }
});

app.post('/api/voucher/validate', async (req, res) => {
    const { code } = req.body;
    const voucher = await Voucher.findOne({ code, isActive: true });
  
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found or inactive' });
    }
  
    res.json({
      type: voucher.type,
      value: voucher.value
    });
  });


// API POST produk
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Product saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Failed to save product' });
    }
});


