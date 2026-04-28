// ── Stats UI ──
const StatsUI = (() => {

  function trendIcon(direction) {
    if (direction === 'up')   return '<span class="trend trend--up">▲</span>';
    if (direction === 'down') return '<span class="trend trend--down">▼</span>';
    return '';
  }

  function fmt(val, suffix = '') {
    return val !== null && val !== undefined ? `${val}${suffix}` : '—';
  }

  function renderOverview(overview, handicap, holeStats) {
    document.getElementById('statHandicap').textContent  = handicap !== null ? handicap : '—';
    document.getElementById('statRounds').textContent    = overview?.count   ?? '—';
    document.getElementById('statAvgGross').textContent  = fmt(overview?.avgGross);
    document.getElementById('statAvgOver').textContent   = fmt(overview?.avgOverPar);
    document.getElementById('statBest').textContent      = fmt(overview?.best);
    document.getElementById('statWorst').textContent     = fmt(overview?.worst);

    if (holeStats) {
      const goodLabel = document.getElementById('statGoodHolesLabel');
      const badLabel  = document.getElementById('statBadHolesLabel');
      const goodVal   = document.getElementById('statGoodHoles');
      const badVal    = document.getElementById('statBadHoles');
      if (goodLabel) goodLabel.textContent = holeStats.goodLabel;
      if (badLabel)  badLabel.textContent  = holeStats.badLabel;
      if (goodVal)   goodVal.innerHTML     = holeStats.goodPct !== null ? `${holeStats.goodPct}% ${trendIcon(holeStats.trend.good)}` : '—';
      if (badVal)    badVal.innerHTML      = holeStats.badPct  !== null ? `${holeStats.badPct}%  ${trendIcon(holeStats.trend.bad)}`  : '—';
    }
  }

  function renderShots(shots, bandAvg, containerId, holeStats) {
    document.getElementById('statGIR').innerHTML        = shots ? `${fmt(shots.gir, '%')} ${trendIcon(shots.trends?.gir)}` : '—';
    document.getElementById('statFairways').innerHTML   = shots ? `${fmt(shots.fairways, '%')} ${trendIcon(shots.trends?.fairways)}` : '—';
    document.getElementById('statPutts').innerHTML      = shots ? `${fmt(shots.putts)} ${trendIcon(shots.trends?.putts)}` : '—';
    document.getElementById('statScrambling').innerHTML = shots ? `${fmt(shots.scrambling, '%')} ${trendIcon(shots.trends?.scrambling)}` : '—';

    if (shots && bandAvg) {
      const chartStats = {
        gir:        shots.gir,
        fairways:   shots.fairways,
        scrambling: shots.scrambling,
        goodHoles:  holeStats?.goodPct ?? null,
      };
      const chartItems = [
        { key: 'gir',        label: 'GIR' },
        { key: 'fairways',   label: 'FWY' },
        { key: 'scrambling', label: 'SCR' },
      ];
      if (holeStats?.goodPct !== null) {
        chartItems.push({ key: 'goodHoles', label: holeStats.isSubTen ? 'Par+' : 'Bog+' });
      }
      const chartBand = {
        ...bandAvg,
        goodHoles: holeStats?.goodPct !== null
          ? (holeStats.isSubTen ? bandAvg.girPlusPct : bandAvg.bogeyPlusPct)
          : null,
      };
      StatsCharts.render(containerId, chartStats, chartBand, chartItems);
    }
  }

  function renderRecoveries(rec, bandAvg, containerId) {
    document.getElementById('statUpDown').innerHTML       = rec && rec.updown !== null   ? `${fmt(rec.updown, '%')} ${trendIcon(rec.trends?.updown)}`   : '—';
    document.getElementById('statSandSave').innerHTML     = rec && rec.sandsave !== null ? `${fmt(rec.sandsave, '%')} ${trendIcon(rec.trends?.sandsave)}` : '—';
    document.getElementById('statPenalties').textContent  = rec ? fmt(rec.penalties)  : '—';
    document.getElementById('statRecoveries').textContent = rec ? fmt(rec.recoveries) : '—';
    document.getElementById('statBunkers').textContent    = rec ? fmt(rec.bunkers)    : '—';

    if (rec && bandAvg) {
      StatsCharts.render(containerId, {
        updown:   rec.updown,
        sandsave: rec.sandsave,
      }, bandAvg, [
        { key: 'updown',   label: 'U&D' },
        { key: 'sandsave', label: 'Sand' },
      ]);
    }
  }

  return { renderOverview, renderShots, renderRecoveries, fmt, trendIcon };
})();