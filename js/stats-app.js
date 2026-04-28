// ── Stats App ──
const StatsApp = (() => {

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


  }

  filterEl?.addEventListener('change', () => {
    currentFilter = filterEl.value;
    refresh();
  });

  refresh();

  return { refresh };
})();