// ── Stats App ──
(() => {

  let currentFilter = 'all';

  const filterEl = document.getElementById('statsFilter');

  function refresh() {
    const all     = StatsData.getRounds();
    const rounds  = StatsData.filterRounds(all, currentFilter);
    const handicap = StatsData.calcHandicap(all); // always from all rounds
    const band    = StatsCalc.getBandAverages(handicap);
    const overview = StatsCalc.getOverview(rounds);
    const shots   = rounds.length ? StatsCalc.getShotStats(rounds) : null;
    const rec     = rounds.length ? StatsCalc.getRecoveryStats(rounds) : null;

    StatsUI.renderOverview(overview, handicap, currentFilter);
    StatsUI.renderShots(shots, band, 'shotChart');
    StatsUI.renderRecoveries(rec, band, 'recoveryChart');

    // AI summaries — only if enough data
    if (rounds.length >= 3 && handicap !== null) {
      StatsUI.renderAI('shot',     shots, handicap, StatsData.KEYS.AI_SHOT,     'aiShot');
      StatsUI.renderAI('recovery', rec,   handicap, StatsData.KEYS.AI_RECOVERY, 'aiRecovery');
    } else {
      const aiEls = ['aiShot', 'aiRecovery'];
      aiEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });
    }
  }

  filterEl?.addEventListener('change', () => {
    currentFilter = filterEl.value;
    refresh();
  });

  refresh();

})();