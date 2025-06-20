const express = require('express');
const path = require('path');
require('dotenv').config();
const session = require('express-session')
const mysql = require('mysql2/promise')

const app = express();

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
  };

let pool;
  try {
    pool = mysql.createPool(dbConfig);
    await pool.query('SELECT 1');
    console.log(' Connected to MySQL database');
  } catch (err) {
    console.error(' Failed to connect to database:', err);
    process.exit(1);
  }

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Session
app.use
// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;