// server.js
// This is the entry point of our backend. It starts the Express server.

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middleware: lets our server accept JSON data and allow the frontend to talk to it
app.use(cors());
app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
  res.send('TeamZen backend is running!');
});

// A health-check route — useful later to confirm the server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

// A database test route — confirms Node.js can talk to MySQL
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ status: 'ok', message: 'Database connected successfully!', result: rows[0].result });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ TeamZen backend running on http://localhost:${PORT}`);
});