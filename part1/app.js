// app.js
const express = require('express');
const mysql = require('mysql2/promise');

async function main() {
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'dw19910416',
    database: 'dogwalks_db'
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


  // Route 1: GET /api/dogs
  app.get('/api/dogs', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
           d.dog_id,
           d.name AS dog_name,
           d.size,
           u.user_id AS owner_id,
           u.username AS owner_username,
           u.email AS owner_email
         FROM Dogs d
         JOIN Users u ON d.owner_id = u.user_id`
      );
      // 直接返回 JSON 数组（可是一行输出）
      res.json(rows);
    } catch (err) {
      console.error('/api/dogs error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Route 2: GET /api/walkrequests/open
  app.get('/api/walkrequests/open', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
           wr.request_id,
           wr.requested_time,
           wr.duration_minutes,
           wr.location,
           wr.status,
           d.dog_id,
           d.name AS dog_name,
           u.user_id AS owner_id,
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

  // Route 3: GET /api/walkers/summary
  // 假设需求：对于每个 role='walker' 的用户，返回：
  //   walker_id, username,
  //   total_applications,
  //   accepted_applications,
  //   completed_requests,
  //   average_rating
  app.get('/api/walkers/summary', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT
           u.user_id AS walker_id,
           u.username,
           -- 总申请数
           COUNT(wa.application_id) AS total_applications,
           -- 被接受的申请数
           SUM(CASE WHEN wa.status = 'accepted' THEN 1 ELSE 0 END) AS accepted_applications,
           -- 完成的请求数：依据 WalkRequests.status = 'completed'
           SUM(CASE WHEN wr.status = 'completed' THEN 1 ELSE 0 END) AS completed_requests,
           -- 平均评分：基于 WalkRatings 表中该 walker 的评分
           AVG(wr2.rating) AS average_rating
         FROM Users u
         LEFT JOIN WalkApplications wa
           ON u.user_id = wa.walker_id
         LEFT JOIN WalkRequests wr
           ON wa.request_id = wr.request_id
         LEFT JOIN WalkRatings wr2
           ON u.user_id = wr2.walker_id
         WHERE u.role = 'walker'
         GROUP BY u.user_id, u.username`
      );
      res.json(rows);
    } catch (err) {
      console.error('/api/walkers/summary error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 启动 HTTP 服务器
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(` Server listening on port ${PORT}`);
  });
}

main().catch(err => {
  console.error('Fatal error in main:', err);
  process.exit(1);
});
