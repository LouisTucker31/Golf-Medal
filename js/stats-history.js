// ── Round History ──
const StatsHistory = (() => {

  let editingId = null;

  function render() {
    const container = document.getElementById('roundHistoryList');
    if (!container) return;

    const rounds = StatsData.getRounds().slice().reverse();

    if (!rounds.length) {
      container.innerHTML = '<p class="history-empty">No rounds added yet.</p>';
      return;
    }

    container.innerHTML = '';
    rounds.forEach(round => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.dataset.id = round.id;

      const date     = new Date(round.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const overPar  = round.overPar !== null ? `+${round.overPar}` : '—';
      const holes    = round.holes === 'front9' ? 'F9' : round.holes === 'back9' ? 'B9' : '18';
      const tee      = round.tee ? ` · ${round.tee}` : '';

      item.innerHTML = `
        <div class="history-item-main">
          <div class="history-item-info">
            <span class="history-course">${escapeHtml(round.course)}</span>
            <span class="history-meta">${date} · ${holes} holes${tee}</span>
          </div>
          <div class="history-item-score">
            <span class="history-gross">${round.gross}</span>
            <span class="history-overpar">${overPar}</span>
          </div>
        </div>
        <div class="history-item-actions hidden">
          <button class="history-edit-btn" data-id="${round.id}">Edit</button>
          <button class="history-delete-btn" data-id="${round.id}">Delete</button>
        </div>
      `;

      // Toggle expand
      item.querySelector('.history-item-main').addEventListener('click', () => {
        const actions = item.querySelector('.history-item-actions');
        const isOpen  = !actions.classList.contains('hidden');
        // Close all others
        document.querySelectorAll('.history-item-actions').forEach(a => a.classList.add('hidden'));
        document.querySelectorAll('.history-item').forEach(i => i.classList.remove('expanded'));
        if (!isOpen) {
          actions.classList.remove('hidden');
          item.classList.add('expanded');
        }
      });

      // Edit
      item.querySelector('.history-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        editingId = round.id;
        StatsInput.openForEdit(round);
      });

      // Delete
      item.querySelector('.history-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete round at ${round.course} on ${date}?`)) {
          StatsData.deleteRound(round.id);
          render();
          StatsApp.refresh();
        }
      });

      container.appendChild(item);
    });
  }

  function getEditingId() { return editingId; }
  function clearEditingId() { editingId = null; }

  function escapeHtml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { render, getEditingId, clearEditingId };
})();