const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Voucher = require('./models/Voucher');
const Admin = require('./models/Admin');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sendEmail = require('./utils/sendEmail');
const ensureLoggedIn = require('./utils/Middleware');
const cors = require('cors');

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
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 jam
      httpOnly: true,
      sameSite: 'lax'
    }
  }));

  // Use CORS middleware to allow requests from specific origin
app.use(cors({
  origin: 'http://localhost:5000', // Allow requests from your frontend URL
  methods: 'GET,POST', // You can add other HTTP methods as necessary
  allowedHeaders: 'Content-Type,Authorization', // Add headers that should be allowed
}));


app.use(express.urlencoded({ extended: true })); // untuk form post dari HTML


// Login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/login.html'));
});

app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin || admin.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.admin = { id: admin._id, username: admin.username };
    res.json({ message: 'Login successful' });
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Logout failed');
      }
      res.clearCookie('connect.sid'); // optional, untuk bersihkan cookie sesi
      res.redirect('/login');
    });
  });


// Static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/checkout.html'));
});

// CMS Dashboard route
app.get('/cms', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/cms/dashboard.html'));
});

// Halaman dalam CMS
app.get('/cms/products', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/cms/products.html'));
});
app.get('/cms/orders', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/cms/order.html'));
});
app.get('/cms/voucher', ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/cms/voucher.html'));
});

//Simulasi Order
// app.post('/api/orders', async (req, res) => {
//     try {
//       const order = new Order({
//         ...req.body,
//         paymentStatus: 'paid',
//         paidAt: new Date()
//       });
//       await order.save();

//       await sendEmail(order.email, order.productName, order.fileUrl); // ✅ Kirim email

//       res.status(201).json({
//         message: 'Order created',
//         downloadLink: order.fileUrl
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Gagal membuat order' });
//     }
//   });

// Serve form tambah produk
// app.get('/add-product', (req, res) => {
//     res.sendFile(path.join(__dirname, 'pages/cms/add-product.html'));
// });


// API: ambil semua produk
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil produk' });
    }
});


// Get single product
app.get('/api/products/:id', ensureLoggedIn, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      res.json(product);
    } catch {
      res.status(404).json({ error: 'Product not found' });
    }
  });
  
// API POST produk
app.post('/api/products', ensureLoggedIn, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Product saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Failed to save product' });
    }
});

// Update product
app.put('/api/products/:id', ensureLoggedIn, async (req, res) => {
    try {
      await Product.findByIdAndUpdate(req.params.id, req.body);
      res.json({ message: 'Product updated' });
    } catch {
      res.status(400).json({ error: 'Failed to update product' });
    }
  });
  
  // Delete product
  app.delete('/api/products/:id', ensureLoggedIn, async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted' });
    } catch {
      res.status(400).json({ error: 'Failed to delete product' });
    }
  });


//API Order
app.get('/api/orders', ensureLoggedIn, async (req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });
  
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order({
            ...req.body,
            paymentStatus: 'paid',
            paidAt: new Date()
        });
        await order.save();

        // await sendEmail(order.email, order.productName, order.fileUrl); // ❌ sementara di-nonaktifkan

        res.status(201).json({
            message: 'Order created',
            downloadLink: order.fileUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal membuat order' });
    }
});


//Voucher API
app.get('/api/vouchers', ensureLoggedIn, async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vouchers' });
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

// Endpoint untuk mengirim email
app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  // Konfigurasi transporter menggunakan SMTP server atau email provider
  const transporter = nodemailer.createTransport({
    service: "gmail", // menggunakan Gmail, bisa diganti dengan provider lain
    auth: {
      user: process.env.EMAIL_USER, // email pengirim (gunakan env var untuk keamanan)
      pass: process.env.EMAIL_PASS, // password email pengirim
    },
  });

  // Setel data email
  const mailOptions = {
    from: process.env.EMAIL_USER, // alamat email pengirim
    to: to, // alamat email penerima
    subject: subject, // subjek email
    text: text, // teks email biasa
    html: html, // HTML email
  };

  try {
    // Kirim email
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ error: "Failed to send email" });
  }
});
