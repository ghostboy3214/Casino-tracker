require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { pool, insertBet } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static('public'));

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: 'connected', time: result.rows[0].now });
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
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('🟢 Client connected');
});

// 🎰 THE CLOUD MOCK FEED (Runs automatically on Render)
const games = ['Crash', 'Dice', 'Mines', 'Plinko', 'Blackjack'];
const currencies = ['BTC', 'ETH', 'LTC'];

setInterval(async () => {
  const amount = (Math.random() * 10).toFixed(8);
  const isWin = Math.random() > 0.4; 
  const payout = isWin ? (amount * (Math.random() * 3 + 1)).toFixed(8) : 0;
  
  const bet = {
    bet_id: `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    settled_at: new Date().toISOString(),
    player_id: `player_${Math.floor(Math.random() * 9999)}`,
    game_name: games[Math.floor(Math.random() * games.length)],
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    amount: parseFloat(amount),
    payout: parseFloat(payout),
    is_highroller: amount > 5.0,
    raw_payload: { source: 'cloud-feed' }
  };

  try {
    await insertBet(bet);
    io.emit('new_bet', bet);
  } catch (err) {
    console.error('Cloud feed error:', err.message);
  }
}, 2000); // Generates a bet every 2 seconds

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Live Casino Dashboard running on port ${PORT}`);
});
