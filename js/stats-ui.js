// ── Stats UI ──
const StatsUI = (() => {

  function trendIcon(direction) {
    if (direction === 'up')     return '<span class="trend trend--up">↗</span>';
    if (direction === 'down')   return '<span class="trend trend--down">↘</span>';
    if (direction === 'steady') return '<span class="trend trend--steady">→</span>';
    return '<span class="trend trend--dash">—</span>';
  }

  function fmt(val, suffix = '') {
    return val !== null && val !== undefined ? `${val}${suffix}` : '—';
  }

  function renderOverview(overview, handicap, filter) {
    document.getElementById('statHandicap').textContent  = handicap !== null ? handicap : '—';
    document.getElementById('statRounds').textContent    = overview?.count   ?? '—';
    document.getElementById('statAvgGross').textContent  = fmt(overview?.avgGross);
    document.getElementById('statAvgDiff').textContent   = fmt(overview?.avgDiff);
    document.getElementById('statAvgOver').textContent   = fmt(overview?.avgOverPar);
    document.getElementById('statBest').textContent      = fmt(overview?.best);
    document.getElementById('statWorst').textContent     = fmt(overview?.worst);
  }

  function renderShots(shots, bandAvg, containerId) {
    document.getElementById('statGIR').innerHTML       = `${fmt(shots?.gir, '%')} ${trendIcon(shots?.trends?.gir)}`;
    document.getElementById('statFairways').innerHTML  = `${fmt(shots?.fairways, '%')} ${trendIcon(shots?.trends?.fairways)}`;
    document.getElementById('statPutts').innerHTML     = `${fmt(shots?.putts)} ${trendIcon(shots?.trends?.putts)}`;
    document.getElementById('statScrambling').innerHTML = `${fmt(shots?.scrambling, '%')} ${trendIcon(shots?.trends?.scrambling)}`;

    if (shots && bandAvg) {
      StatsCharts.render(containerId, {
        gir:       shots.gir,
        fairways:  shots.fairways,
        putts:     shots.putts,
        scrambling: shots.scrambling,
      }, bandAvg, [
        { key: 'gir',       label: 'GIR' },
        { key: 'fairways',  label: 'FWY' },
        { key: 'scrambling', label: 'SCR' },
      ]);
    }
  }

  function renderRecoveries(rec, bandAvg, containerId) {
    document.getElementById('statUpDown').innerHTML   = `${fmt(rec?.updown, '%')} ${trendIcon(rec?.trends?.updown)}`;
    document.getElementById('statSandSave').innerHTML = `${fmt(rec?.sandsave, '%')} ${trendIcon(rec?.trends?.sandsave)}`;
    document.getElementById('statPenalties').textContent  = fmt(rec?.penalties);
    document.getElementById('statRecoveries').textContent = fmt(rec?.recoveries);
    document.getElementById('statBunkers').textContent    = fmt(rec?.bunkers);

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

  async function renderAI(type, stats, handicap, cacheKey, elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = 'Generating insight…';

    const result = await StatsAI.generate(type, stats, handicap, cacheKey);
    if (result) {
      el.textContent = result.text;
      if (result.cached && result.updatedAt) {
        const date = new Date(result.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        el.insertAdjacentHTML('afterend', `<span class="ai-cached">Last updated ${date}</span>`);
      }
    } else {
      el.textContent = '';
    }
  }

  return { renderOverview, renderShots, renderRecoveries, renderAI, fmt, trendIcon };
})();