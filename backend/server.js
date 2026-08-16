// server.js
// This is the entry point of our backend. It starts the Express server.

const express = require('express');
const cors = require('cors');

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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ TeamZen backend running on http://localhost:${PORT}`);
});