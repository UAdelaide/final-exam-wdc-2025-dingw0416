// app.js
const express = require('express');
const mysql = require('mysql2/promise');

async function main() {

  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',dw19910416
    database: 'DogWalkService',

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

  const app = express();
  app.use(express.json());

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

  //GET /api/walkrequests/open

  app.get('/api/walkrequests/open', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
           wr.request_id,
           d.name AS dog_name,
           wr.requested_time,
           wr.duration_minutes,
           wr.location,
           u.username AS owner_username
         FROM WalkRequests wr
         JOIN Dogs d ON wr.dog_id = d.dog_id
         JOIN Users u ON d.owner_id = u.user_id
         WHERE wr.status = 'open'`
      );
      res.json(rows);
    } catch (err) {
      console.error('/api/walkrequests/open error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/walkers/summary

  app.get('/api/walkers/summary', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
           u.username AS walker_username,
           COUNT(wr.rating_id) AS total_ratings,
           AVG(wr.rating) AS average_rating,
           COUNT(wr.rating_id) AS completed_walks
         FROM Users u
         LEFT JOIN WalkRatings wr ON u.user_id = wr.walker_id
         WHERE u.role = 'walker'
         GROUP BY u.user_id, u.username`
      );
      res.json(rows);
    } catch (err) {
      console.error('/api/walkers/summary error:', err);
      res.status(500).json({ error: err.message });
    }
  });


  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(` Server listening on port ${PORT}`);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
