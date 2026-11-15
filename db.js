const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on('error', (err) => console.error('Unexpected DB error', err));

async function insertBet(bet) {
  const query = `
    INSERT INTO bets (bet_id, settled_at, player_id, game_name, currency, amount, payout, is_highroller, raw_payload)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (bet_id) DO NOTHING RETURNING *;
  `;
  const values = [
    bet.bet_id, bet.settled_at, bet.player_id, bet.game_name,
    bet.currency, bet.amount, bet.payout, bet.is_highroller, bet.raw_payload
  ];
  return pool.query(query, values);
}

module.exports = { pool, insertBet };
