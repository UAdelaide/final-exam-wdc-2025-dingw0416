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
    console.log('✅ Connected to MySQL database');
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }

  const app = express();
  // If you need JSON body parsing for other routes, enable:
  // app.use(express.json());

  /**
   * GET /api/dogs
   * 返回所有狗：dog_name、size、owner_username
   * Sample Response:
   * [
   *   { "dog_name": "Max", "size": "medium", "owner_username": "alice123" },
   *   { "dog_name": "Bella", "size": "small", "owner_username": "carol123" }
   * ]
   */
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
      // 直接返回 JSON 数组
      res.json(rows);
    } catch (err) {
      console.error('/api/dogs error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/walkrequests/open
   * 返回所有 status = 'open' 的请求：request_id、dog_name、requested_time、duration_minutes、location、owner_username
   * Sample Response:
   * [
   *   {
   *     "request_id": 1,
   *     "dog_name": "Max",
   *     "requested_time": "2025-06-10T08:00:00.000Z",
   *     "duration_minutes": 30,
   *     "location": "Parklands",
   *     "owner_username": "alice123"
   *   }
   * ]
   */
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

  /**
   * GET /api/walkers/summary
   * 返回每个 walker 的摘要：walker_username、total_ratings、average_rating、completed_walks
   * - total_ratings: 该 walker 在 WalkRatings 表中的评分数
   * - average_rating: 平均评分，若无评分则为 null
   * - completed_walks: 认为与 total_ratings 相同，表示已完成并被评分的遛狗次数
   * Sample Response:
   * [
   *   { "walker_username": "bobwalker", "total_ratings": 2, "average_rating": 4.5, "completed_walks": 2 },
   *   { "walker_username": "newwalker", "total_ratings": 0, "average_rating": null, "completed_walks": 0 }
   * ]
   */
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

  // 启动服务器
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
