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
app.set('views', path.join(__dirname, 'views/Pages')); // Correct path to the Pages directory

// ==========================
// 📁 Static Assets
// ==========================
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ==========================
// 🔁 Proxy API to Flask
// ==========================
// Proxy API requests to the Flask backend
app.use('/api', createProxyMiddleware({
  target: 'http://54.165.254.61:5000', // Your backend's public IP and port
  changeOrigin: true
}));
// ==========================
// 🌐 Routes
// ==========================

// Landing page
app.get('/', (req, res) => {
  res.render('landing'); // Don't include 'pages/' here as it's already set in the views path
});

// Register page
app.get('/register', (req, res) => res.render('pages/register'));

// Login page
app.get('/login', (req, res) => res.render('pages/login'));

// Login POST handler
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post('http://127.0.0.1:5000/api/login', {
      email,
      password
    });

    if (response.data && response.data.user_id) {
      req.session.user = {
        user_id: response.data.user_id,
        username: email.split('@')[0],
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

// Forums (protected)
app.get('/forums', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  try {
    const response = await axios.get('http://127.0.0.1:5000/api/forums/1'); // Replace 1 with dynamic group ID if needed
    const forums = response.data || [];
    res.render('pages/forums', { user, forums });
  } catch (err) {
    console.error('Error fetching forums:', err.message);
    res.render('pages/forums', { user, forums: [] });
  }
});

// Groups (protected)
app.get('/groups', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  res.render('pages/groups', { user });
});

// Events (protected)
app.get('/events', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  try {
    const response = await axios.get('http://127.0.0.1:5000/api/events');
    const events = response.data || [];

    res.render('pages/events', { user, events });
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.render('pages/events', { user, events: [] }); // fallback to empty array
  }
});


// Settings (protected)
app.get('/settings', (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');
  res.render('pages/settings', { user });
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
