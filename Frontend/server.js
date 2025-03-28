const express = require('express');
const path = require('path');
const session = require('express-session');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// =======================
// 🔧 Middleware Setup
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'interestlink_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// =======================
// 📁 EJS View Engine Setup
// =======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // ✅ FIXED


// =======================
// 📂 Static Files (Assets, JS)
// =======================
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/server.js', express.static(path.join(__dirname, 'server.js'))); // If needed on front

// =======================
// 🔁 Proxy API to Flask
// =======================
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:5000',
  changeOrigin: true
}));

// =======================
// 🌐 Routes
// =======================

// ✅ Landing Page
app.get('/', (req, res) => {
  res.render('pages/landing');
});

// ✅ Login Page
app.get('/login', (req, res) => {
  res.render('pages/login');
});

// ✅ Dashboard Page
app.get('/dashboard', (req, res) => {
  res.render('pages/dashboard');
});

// ✅ Add others like register.ejs when ready
// app.get('/register', (req, res) => res.render('pages/register'));

// =======================
// ❌ 404 Fallback
// =======================
app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

// =======================
// 🚀 Launch Server
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 InterestLink frontend running at: http://localhost:${PORT}`);
});
