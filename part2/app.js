const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const mysql = require('mysql2/promise')

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret: 'mysecretkey123',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

// -------- Login Route --------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

    if (rows.length === 0 || rows[0].password_hash !== password) {
      return res.redirect('/?error=invalid');
    }

    const user = rows[0];
    req.session.userId = user.user_id;
    req.session.role = user.role;

    if (user.role === 'owner') {
      return res.redirect('/owner-dashboard.html');
    } else if (user.role === 'walker') {
      return res.redirect('/walker-dashboard.html');
    } else {
      return res.redirect('/');
    }

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server Error');
  }
});
// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;