require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { pool, insertBet } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static('public')); // SERVES THE FRONTEND

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ik', db: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.post('/api/ingest', async (req, res) => {
  try {
    const bet = req.body;
    await insertBet(bet);
    io.emit('new_bet', bet);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Ingest error:', err);
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('🟢 A client connected to dashboard');
  socket.on('disconnect', () => console.log('🔴 Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Live Casino Dashboard running at http://localhost:${PORT}`);
});
