const games = ['Crash', 'Dice', 'Mines', 'Plinko', 'Blackjack'];
const currencies = ['BTC', 'ETH', 'LTC'];

async function sendMockBet() {
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
    raw_payload: { source: 'mock-feed' }
  };

  try {
    const res = await fetch('http://localhost:3000/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bet)
    });
    
    if (res.ok) {
      console.log(`🎢 Sent bet: ${bet.amount} ${bet.currency} on ${bet.game_name}`);
    }
  } catch (err) {
    console.error('Failed to send mock bet. Is server.js running?');
  }
}

console.log('🎰 Mock Feed Started. Sending bets...');
setInterval(sendMockBet, 2000);
