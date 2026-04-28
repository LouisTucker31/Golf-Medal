// ── Stats Calculations ──
const StatsCalc = (() => {

  // ── Handicap band averages ──
  // Sources: Shot Scope, Game Golf, typical amateur averages
  const BAND_AVERAGES = {
    '0-5':   { gir: 72, fairways: 62, putts: 29, scrambling: 58, updown: 52, sandsave: 48, penalties: 0.4, recoveries: 1.2, bunkers: 1.5, girPlusPct: 65, bogeyPlusPct: 88 },
    '5-10':  { gir: 58, fairways: 55, putts: 31, scrambling: 45, updown: 40, sandsave: 35, penalties: 0.7, recoveries: 1.8, bunkers: 2.0, girPlusPct: 52, bogeyPlusPct: 78 },
    '10-15': { gir: 42, fairways: 48, putts: 33, scrambling: 35, updown: 30, sandsave: 25, penalties: 1.0, recoveries: 2.2, bunkers: 2.3, girPlusPct: 38, bogeyPlusPct: 68 },
    '15-20': { gir: 28, fairways: 40, putts: 34, scrambling: 25, updown: 22, sandsave: 18, penalties: 1.4, recoveries: 2.6, bunkers: 2.5, girPlusPct: 25, bogeyPlusPct: 58 },
    '20-25': { gir: 18, fairways: 33, putts: 35, scrambling: 18, updown: 16, sandsave: 12, penalties: 1.8, recoveries: 3.0, bunkers: 2.8, girPlusPct: 16, bogeyPlusPct: 48 },
    '25-28': { gir: 10, fairways: 26, putts: 36, scrambling: 12, updown: 10, sandsave: 8,  penalties: 2.2, recoveries: 3.4, bunkers: 3.0, girPlusPct: 10, bogeyPlusPct: 38 },
  };

  function getBand(handicap) {
    if (handicap === null) return null;
    if (handicap <= 5)  return '0-5';
    if (handicap <= 10) return '5-10';
    if (handicap <= 15) return '10-15';
    if (handicap <= 20) return '15-20';
    if (handicap <= 25) return '20-25';
    return '25-28';
  }

  function getBandAverages(handicap) {
    const band = getBand(handicap);
    return band ? BAND_AVERAGES[band] : null;
  }

  // ── Averages ──
  function avg(rounds, key) {
    const vals = rounds.map(r => r[key]).filter(v => v !== null && v !== undefined);
    if (!vals.length) return null;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }

  function pct(rounds, hitKey, totalKey) {
    const totals = rounds.reduce((acc, r) => {
      if (r[hitKey] !== null && r[totalKey] !== null) {
        acc.hit   += r[hitKey]   || 0;
        acc.total += r[totalKey] || 0;
      }
      return acc;
    }, { hit: 0, total: 0 });
    if (!totals.total) return null;
    return Math.round((totals.hit / totals.total) * 100);
  }

  // ── Trend ──
  // Needs min 5 rounds, consistent direction across 3 of last 5
  function trend(rounds, key, lowerIsBetter = false) {
    if (rounds.length < 5) return 'dash';
    const vals = rounds.slice(-5).map(r => r[key]).filter(v => v !== null);
    if (vals.length < 5) return 'dash';

    let ups = 0, downs = 0;
    for (let i = 1; i < vals.length; i++) {
      if (vals[i] > vals[i-1]) ups++;
      else if (vals[i] < vals[i-1]) downs++;
    }

    const improving = lowerIsBetter ? downs >= 3 : ups >= 3;
    const declining = lowerIsBetter ? ups >= 3   : downs >= 3;

    if (improving) return 'up';
    if (declining) return 'down';
    return 'steady';
  }

  // ── Overview stats ──
  function getOverview(rounds) {
    if (!rounds.length) return null;
    const gross = rounds.map(r => r.gross).filter(Boolean);
    return {
      count:      rounds.length,
      avgGross:   avg(rounds, 'gross'),
      avgDiff:    avg(rounds, 'differential'),
      avgOverPar: avg(rounds, 'overPar'),
      best:       gross.length ? Math.min(...gross) : null,
      worst:      gross.length ? Math.max(...gross) : null,
    };
  }

  // ── Shot stats ──
  function getShotStats(rounds) {
    return {
      gir:       pct(rounds, 'girHit', 'girTotal'),
      fairways:  pct(rounds, 'fairwaysHit', 'fairwaysTotal'),
      putts:     avg(rounds, 'putts'),
      scrambling: pct(rounds, 'scramblingHit', 'scramblingTotal'),
      trends: {
        gir:       trend(rounds, 'girHit'),
        fairways:  trend(rounds, 'fairwaysHit'),
        putts:     trend(rounds, 'putts', true),
        scrambling: trend(rounds, 'scramblingHit'),
      }
    };
  }

  // ── Hole score stats ──
  function getHoleStats(rounds, handicap) {
    const isSubTen = handicap !== null && handicap < 10;

    const goodHoles = rounds.reduce((acc, r) => {
      if (r.eagleOrBetter === null) return acc;
      const good = isSubTen
        ? (r.eagleOrBetter + r.birdies + r.pars)
        : (r.eagleOrBetter + r.birdies + r.pars + r.bogeys);
      acc.hit   += good;
      acc.total += 18;
      return acc;
    }, { hit: 0, total: 0 });

    const badHoles = rounds.reduce((acc, r) => {
      if (r.eagleOrBetter === null) return acc;
      const bad = isSubTen
        ? (r.bogeys + r.doubles + r.tripleOrWorse)
        : (r.doubles + r.tripleOrWorse);
      acc.hit   += bad;
      acc.total += 18;
      return acc;
    }, { hit: 0, total: 0 });

    return {
      isSubTen,
      goodPct: goodHoles.total ? Math.round((goodHoles.hit / goodHoles.total) * 100) : null,
      badPct:  badHoles.total  ? Math.round((badHoles.hit  / badHoles.total)  * 100) : null,
      goodLabel: isSubTen ? 'Par or Better' : 'Bogey or Better',
      badLabel:  isSubTen ? 'Bogey or Worse' : 'Double or Worse',
      trend: {
        good: trend(rounds.filter(r => r.eagleOrBetter !== null), isSubTen ? 'pars' : 'bogeys'),
        bad:  trend(rounds.filter(r => r.eagleOrBetter !== null), 'doubles', true),
      }
    };
  }

  // ── Recovery stats ──
  function getRecoveryStats(rounds) {
    return {
      updown:     pct(rounds, 'updownHit', 'updownTotal'),
      sandsave:   pct(rounds, 'sandsaveHit', 'sandsaveTotal'),
      penalties:  avg(rounds, 'penalties'),
      recoveries: avg(rounds, 'recoveries'),
      bunkers:    avg(rounds, 'bunkers'),
      trends: {
        updown:   trend(rounds, 'updownHit'),
        sandsave: trend(rounds, 'sandsaveHit'),
        penalties: trend(rounds, 'penalties', true),
      }
    };
  }

  return {
    getBand, getBandAverages,
    getOverview, getShotStats, getRecoveryStats, getHoleStats,
    avg, pct, trend
  };
})();