import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});

// Record a vote
app.post('/vote', async (req, res) => {
  const { participant, attractionId, category } = req.body;
  if (!participant || !attractionId || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  await db.query(
    'INSERT INTO votes (participant, attraction_id, category) VALUES (?, ?, ?)',
    [participant, attractionId, category]
  );
  res.json({ success: true });
});

// Get current vote tallies
app.get('/votes', async (req, res) => {
  const [rows] = await db.query(
    'SELECT attraction_id, category, COUNT(*) as votes FROM votes GROUP BY attraction_id, category'
  );
  res.json(rows);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
