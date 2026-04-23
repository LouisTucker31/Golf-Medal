/* ── Fairway Golf App ── */

const state = {
  rounds: JSON.parse(localStorage.getItem('fairway_rounds') || '[]'),
  activeRoundId: null,
  currentFilter: 'all',
};

/* ── Persist ── */
function save() {
  localStorage.setItem('fairway_rounds', JSON.stringify(state.rounds));
}

/* ── Utils ── */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function vsParLabel(score, par) {
  if (!score || !par) return { text: '—', cls: 'even' };
  const diff = score - par;
  if (diff === 0) return { text: 'E', cls: 'even' };
  if (diff > 0)   return { text: `+${diff}`, cls: 'over' };
  return { text: `${diff}`, cls: 'under' };
}

function totalScore(round) {
  return round.scores.reduce((s, v) => s + (v || 0), 0);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ── Pill Nav ── */
const pillBtns   = document.querySelectorAll('.pill-btn');
const pillSlider = document.getElementById('pillSlider');
const pages      = document.querySelectorAll('.page');

function movePillTo(btn) {
  const nav  = document.getElementById('pillNav');
  const navRect = nav.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  pillSlider.style.left  = (btnRect.left - navRect.left - 3) + 'px'; // compensate pill-nav padding 3px
  pillSlider.style.width = btnRect.width + 'px';
}

function activatePage(pageId) {
  pillBtns.forEach(b => b.classList.toggle('active', b.dataset.page === pageId));
  pages.forEach(p => {
    const active = p.id === 'page-' + pageId;
    p.classList.toggle('active', active);
  });
  const activeBtn = document.querySelector(`.pill-btn[data-page="${pageId}"]`);
  if (activeBtn) movePillTo(activeBtn);
  if (pageId === 'stats') renderStats();
  if (pageId === 'scorecards') renderScorecards();
  if (pageId === 'dashboard') renderDashboard();
}

pillBtns.forEach(btn => {
  btn.addEventListener('click', () => activatePage(btn.dataset.page));
});

// Init slider position on load
window.addEventListener('load', () => {
  const active = document.querySelector('.pill-btn.active');
  if (active) movePillTo(active);
  renderDashboard();
});

/* ── Dashboard ── */
function renderDashboard() {
  const list = document.getElementById('recentRoundsList');
  const recent = [...state.rounds].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  if (!recent.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🏌️</div><p>No rounds yet. Hit the course!</p></div>`;
    return;
  }
  list.innerHTML = recent.map(r => roundCardHTML(r)).join('');
  list.querySelectorAll('.round-card').forEach(card => {
    card.addEventListener('click', () => openScorecard(card.dataset.id));
  });
}

function roundCardHTML(r) {
  const score = totalScore(r);
  const vp    = vsParLabel(score || null, r.par);
  return `
    <div class="round-card" data-id="${r.id}">
      <div class="round-card-left">
        <div class="round-course">${r.course || 'Unnamed Course'}</div>
        <div class="round-meta">${formatDate(r.date)} · ${r.holes} Holes</div>
      </div>
      <div class="round-card-right">
        <div class="round-score-big">${score || '—'}</div>
        ${score ? `<span class="round-vs-par ${vp.cls}">${vp.text}</span>` : ''}
      </div>
    </div>
  `;
}

/* ── Scorecards ── */
function renderScorecards(filter) {
  if (filter) state.currentFilter = filter;
  const list = document.getElementById('scorecardsList');
  let rounds = [...state.rounds].sort((a, b) => b.date.localeCompare(a.date));
  if (state.currentFilter === '18') rounds = rounds.filter(r => r.holes == 18);
  if (state.currentFilter === '9')  rounds = rounds.filter(r => r.holes == 9);

  if (!rounds.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No scorecards yet.<br>Start a new round to begin.</p></div>`;
    return;
  }
  list.innerHTML = rounds.map(r => roundCardHTML(r)).join('');
  list.querySelectorAll('.round-card').forEach(card => {
    card.addEventListener('click', () => openScorecard(card.dataset.id));
  });
}

document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderScorecards(chip.dataset.filter);
  });
});

/* ── Stats ── */
function renderStats() {
  const rounds = state.rounds.filter(r => totalScore(r) > 0);
  const empty  = document.getElementById('statsEmpty');
  const grid   = document.getElementById('statsGrid');
  const st     = document.getElementById('statsSectionTitle');
  const chart  = document.getElementById('trendChart');

  if (!rounds.length) {
    empty.style.display = '';
    grid.style.display  = 'none';
    st.style.display    = 'none';
    chart.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  grid.style.display  = 'grid';
  st.style.display    = '';
  chart.style.display = 'flex';

  const scores   = rounds.map(r => totalScore(r));
  const pars     = rounds.map(r => r.par).filter(Boolean);
  const diffs    = rounds.map(r => totalScore(r) - (r.par || 0)).filter((_, i) => rounds[i].par);
  const avgDiff  = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : null;
  const best     = Math.min(...scores);

  document.getElementById('statAvgScore').textContent = avgDiff !== null ? (avgDiff >= 0 ? `+${avgDiff}` : `${avgDiff}`) : '—';
  document.getElementById('statBestRound').textContent = best;
  document.getElementById('statRoundsPlayed').textContent = state.rounds.length;
  document.getElementById('statHandicap').textContent = avgDiff !== null ? Math.max(0, avgDiff).toFixed(1) : '—';

  // Trend chart
  const sorted = [...rounds].sort((a, b) => a.date.localeCompare(b.date)).slice(-8);
  const maxScore = Math.max(...sorted.map(r => totalScore(r)));
  const minScore = Math.min(...sorted.map(r => totalScore(r)));
  const range = Math.max(maxScore - minScore, 1);
  const maxBarH = 60;

  chart.innerHTML = sorted.map((r, i) => {
    const sc = totalScore(r);
    const h  = maxBarH - Math.round(((sc - minScore) / range) * (maxBarH - 12));
    const isBest = sc === minScore;
    return `
      <div class="trend-bar-wrap">
        <div class="trend-bar${isBest ? ' best' : ''}" style="height:${h}px;"></div>
        <div class="trend-label">${formatDate(r.date).split(' ').slice(0,2).join(' ')}</div>
      </div>
    `;
  }).join('');
}

/* ── New Round Modal ── */
const newRoundModal   = document.getElementById('newRoundModal');
const newRoundBtns    = [document.getElementById('startRoundBtn'), document.getElementById('newRoundBtnSC')];
const cancelRoundBtn  = document.getElementById('cancelRoundBtn');
const createRoundBtn  = document.getElementById('createRoundBtn');

function openNewRoundModal() {
  document.getElementById('courseName').value = '';
  document.getElementById('roundDate').value  = new Date().toISOString().split('T')[0];
  document.getElementById('roundHoles').value = '18';
  document.getElementById('coursePar').value  = '';
  newRoundModal.classList.add('open');
}

function closeNewRoundModal() {
  newRoundModal.classList.remove('open');
}

newRoundBtns.forEach(btn => btn.addEventListener('click', openNewRoundModal));
cancelRoundBtn.addEventListener('click', closeNewRoundModal);
newRoundModal.addEventListener('click', e => { if (e.target === newRoundModal) closeNewRoundModal(); });

createRoundBtn.addEventListener('click', () => {
  const course = document.getElementById('courseName').value.trim();
  const date   = document.getElementById('roundDate').value;
  const holes  = parseInt(document.getElementById('roundHoles').value);
  const par    = parseInt(document.getElementById('coursePar').value) || null;

  if (!course) {
    document.getElementById('courseName').focus();
    document.getElementById('courseName').style.borderColor = '#DC2626';
    setTimeout(() => document.getElementById('courseName').style.borderColor = '', 1500);
    return;
  }

  const defaultPar = par || (holes === 18 ? 72 : 36);
  const round = {
    id:     generateId(),
    course,
    date:   date || new Date().toISOString().split('T')[0],
    holes,
    par:    defaultPar,
    scores: Array(holes).fill(0),
    pars:   buildDefaultPars(holes, defaultPar),
  };

  state.rounds.push(round);
  save();
  closeNewRoundModal();
  openScorecard(round.id);
});

function buildDefaultPars(holes, totalPar) {
  // Distribute par across holes as evenly as possible, realistic golf pars
  const pars = [];
  if (holes === 18) {
    // 4 par3, 10 par4, 4 par5 = 72
    const template = [4,4,3,4,5,4,3,4,4, 4,4,3,4,5,4,3,4,5];
    return template;
  } else {
    const template = [4,3,4,5,4,3,4,4,5];
    return template;
  }
}

/* ── Scorecard Modal ── */
const scorecardModal = document.getElementById('scorecardModal');
const closeSCModal   = document.getElementById('closeSCModal');
const saveRoundBtn   = document.getElementById('saveRoundBtn');
const deleteRoundBtn = document.getElementById('deleteRoundBtn');

function openScorecard(id) {
  state.activeRoundId = id;
  const round = state.rounds.find(r => r.id === id);
  if (!round) return;

  document.getElementById('scModalCourse').textContent = round.course;
  document.getElementById('scModalDate').textContent   = `${formatDate(round.date)} · ${round.holes} Holes`;
  document.getElementById('scTotalPar').textContent    = round.par || '—';

  renderHoleGrid(round);
  updateTotals(round);
  scorecardModal.classList.add('open');
}

function closeScorecard() {
  scorecardModal.classList.remove('open');
  state.activeRoundId = null;
}

closeSCModal.addEventListener('click', closeScorecard);
scorecardModal.addEventListener('click', e => { if (e.target === scorecardModal) closeScorecard(); });

saveRoundBtn.addEventListener('click', () => {
  // Scores already saved on input; just close
  save();
  closeScorecard();
  renderDashboard();
  renderScorecards();
});

deleteRoundBtn.addEventListener('click', () => {
  if (!state.activeRoundId) return;
  if (!confirm('Delete this round?')) return;
  state.rounds = state.rounds.filter(r => r.id !== state.activeRoundId);
  save();
  closeScorecard();
  renderDashboard();
  renderScorecards();
});

function renderHoleGrid(round) {
  const grid = document.getElementById('holeGrid');
  grid.innerHTML = round.scores.map((score, i) => {
    const par    = round.pars ? round.pars[i] : 4;
    const cls    = scoreClass(score, par);
    return `
      <div class="hole-cell">
        <span class="hole-num">Hole ${i + 1}</span>
        <span class="hole-par-label">Par ${par}</span>
        <input
          class="hole-score-input ${cls}"
          type="number"
          inputmode="numeric"
          min="1" max="20"
          value="${score || ''}"
          placeholder="${par}"
          data-hole="${i}"
        />
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.hole-score-input').forEach(input => {
    input.addEventListener('input', () => {
      const idx   = parseInt(input.dataset.hole);
      const val   = parseInt(input.value) || 0;
      const round = state.rounds.find(r => r.id === state.activeRoundId);
      if (!round) return;
      round.scores[idx] = val;
      const par = round.pars ? round.pars[idx] : 4;
      input.className = 'hole-score-input ' + scoreClass(val, par);
      updateTotals(round);
    });
  });
}

function scoreClass(score, par) {
  if (!score) return '';
  const diff = score - par;
  if (diff <= -2) return 'eagle';
  if (diff === -1) return 'birdie';
  if (diff === 1)  return 'bogey';
  if (diff >= 2)   return 'double';
  return '';
}

function updateTotals(round) {
  const score = totalScore(round);
  document.getElementById('scTotalScore').textContent = score || '—';
  if (score && round.par) {
    const diff = score - round.par;
    const el   = document.getElementById('scTotalDiff');
    el.textContent = diff === 0 ? 'E' : (diff > 0 ? `+${diff}` : `${diff}`);
    el.style.color = diff > 0 ? '#DC2626' : diff < 0 ? '#16A34A' : 'inherit';
  } else {
    document.getElementById('scTotalDiff').textContent = '—';
  }
}

/* ── Init ── */
renderDashboard();
