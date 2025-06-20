const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session');
const pool = require('./dbConfig.js');
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
app.use(express.urlencoded({ extended: true}));

  // GET /api/dogs
  app.get('/api/dogs', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
           d.name AS dog_name,
           d.size,
           u.username AS owner_username
         FROM Dogs d
         JOIN Users u ON d.owner_id = u.user_id`
      );

      res.json(rows);
    } catch (err) {
      console.error('/api/dogs error:', err);
      res.status(500).json({ error: err.message });
    }
  });

// -------- Login Route --------
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
      [username, password]
    );

    if (rows.length === 1) {
      const user = rows[0];
      req.session.user = user;

      if (user.role === 'owner') {
        return res.redirect('/owner-dashboard.html');
      }

      if (user.role === 'walker') {
        return res.redirect('/walker-dashboard.html');
      }

      return res.status(403).send('Unknown role');
    }

    return res.status(401).send('Invalid credentials');

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server Error');
  }
});
// -------- Logout Route --------
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Could not log out');
    }
    res.clearCookie('connect.sid');
    res.redirect('/index.html');
  });
});
// -------- Protected Dashboards --------
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/');
}

app.get('/owner-dashboard.html', ensureAuthenticated, (req, res) => {
  if (req.session.role === 'owner') {
    return res.sendFile(path.join(__dirname, 'public', 'owner-dashboard.html'));
  }
  res.redirect('/');
});

app.get('/walker-dashboard.html', ensureAuthenticated, (req, res) => {
  if (req.session.role === 'walker') {
    return res.sendFile(path.join(__dirname, 'public', 'walker-dashboard.html'));
  }
  res.redirect('/');
});

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;