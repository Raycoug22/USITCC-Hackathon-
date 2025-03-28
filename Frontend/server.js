const express = require('express');
const path = require('path');
const session = require('express-session');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// ==========================
// 🔧 Middleware Setup
// ==========================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'interestlink_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// ==========================
// 🖼️ View Engine (EJS)
// ==========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==========================
// 📁 Static Assets
// ==========================
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ==========================
// 🔁 Proxy API to Flask
// ==========================
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:5000',
  changeOrigin: true
}));

// ==========================
// 🌐 Routes
// ==========================

// Landing page
app.get('/', (req, res) => res.render('pages/landing'));

//register page
app.get('/register', (req, res) => res.render('pages/register'));

// Login page
app.get('/login', (req, res) => res.render('pages/login'));

// Login POST handler (calls Flask API)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post('http://127.0.0.1:5000/api/login', {
      email,
      password
    });

    if (response.data && response.data.user_id) {
      // Store user info in session
      req.session.user = {
        user_id: response.data.user_id,
        username: email.split('@')[0], // default username
        email
      };

      return res.redirect('/dashboard');
    } else {
      return res.redirect('/login');
    }

  } catch (err) {
    console.error('Login failed:', err.message);
    return res.redirect('/login');
  }
});

// Dashboard (protected)
app.get('/dashboard', (req, res) => {
  const user = req.session.user;

  if (!user) return res.redirect('/login');

  res.render('pages/dashboard', { user });
});

// Interest Explorer (protected)
app.get('/explorer', (req, res) => {
  const user = req.session.user;

  if (!user) return res.redirect('/login');

  res.render('pages/explorer', { user });
});

// ==========================
// ❌ 404 Handler
// ==========================
app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

// ==========================
// 🚀 Start Server
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 InterestLink frontend running at: http://localhost:${PORT}`);
});
