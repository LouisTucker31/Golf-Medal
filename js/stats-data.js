// ── Stats Data & Storage ──
const StatsData = (() => {

  const KEYS = {
    ROUNDS:       'stats_rounds',
    AI_SHOT:      'stats_ai_shot',
    AI_RECOVERY:  'stats_ai_recovery',
  };

  // ── Rounds ──
  function getRounds() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.ROUNDS)) || [];
    } catch { return []; }
  }

  function saveRounds(rounds) {
    localStorage.setItem(KEYS.ROUNDS, JSON.stringify(rounds));
  }

  function addRound(round) {
    const rounds = getRounds();
    round.id   = Date.now();
    round.date = round.date || new Date().toISOString();
    rounds.push(round);
    saveRounds(rounds);
    return round;
  }

  function deleteRound(id) {
    const rounds = getRounds().filter(r => r.id !== id);
    saveRounds(rounds);
  }

  // ── Filter ──
  function filterRounds(rounds, filter) {
    const now   = new Date();
    const year  = now.getFullYear();
    switch (filter) {
      case 'year':
        return rounds.filter(r => new Date(r.date).getFullYear() === year);
      case 'last20':
        return rounds.slice(-20);
      case 'last10':
        return rounds.slice(-10);
      case 'last5':
        return rounds.slice(-5);
      default:
        return rounds;
    }
  }

  // ── WHS Handicap Calculation ──
  function calcHandicap(rounds) {
    if (rounds.length < 3) return null;

    const recent = rounds.slice(-20);
    const diffs  = recent
      .map(r => r.differential)
      .filter(d => d !== null && d !== undefined)
      .sort((a, b) => a - b);

    const count  = diffs.length;
    let best;

    if (count < 3)  return null;
    if (count === 3)  best = diffs.slice(0, 1);
    else if (count <= 5)  best = diffs.slice(0, 2);
    else if (count <= 8)  best = diffs.slice(0, 3);
    else if (count <= 11) best = diffs.slice(0, 4);
    else if (count <= 14) best = diffs.slice(0, 5);
    else if (count <= 16) best = diffs.slice(0, 6);
    else if (count <= 18) best = diffs.slice(0, 7);
    else                  best = diffs.slice(0, 8);

    const avg = best.reduce((a, b) => a + b, 0) / best.length;
    return Math.round(avg * 10) / 10;
  }

  // ── AI Cache ──
  function getAICache(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || null;
    } catch { return null; }
  }

  function saveAICache(key, data) {
    localStorage.setItem(key, JSON.stringify({
      text:      data,
      updatedAt: new Date().toISOString()
    }));
  }

  return {
    getRounds, saveRounds, addRound, deleteRound,
    filterRounds, calcHandicap,
    getAICache, saveAICache,
    KEYS
  };
})();