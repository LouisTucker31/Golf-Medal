// ── UI helpers ──
const UI = (() => {

  // Elements
  const resultsSection  = document.getElementById('resultsSection');
  const emptyState      = document.getElementById('emptyState');
  const displayCourseName     = document.getElementById('displayCourseName');
  const displayCourseMeta     = document.getElementById('displayCourseMeta');
  const displayCourseHandicap = document.getElementById('displayCourseHandicap');
  const goldRange   = document.getElementById('goldRange');
  const silverRange = document.getElementById('silverRange');
  const bronzeRange = document.getElementById('bronzeRange');
  const hiEditBtn   = document.getElementById('hiEditBtn');
  const hiEditValue = document.getElementById('hiEditValue');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const searchDropdown = document.getElementById('searchDropdown');

  const estimatedWarning = document.getElementById('estimatedWarning');

  function getStats(course) {
    if (course.holes === 'front9') return course.statsFront || null;
    if (course.holes === 'back9')  return course.statsBack  || null;
    return course.stats18 || null;
  }

  function showResults(course, hi, onEstimatedTap) {
    const stats = getStats(course);

    // Fallback to legacy flat shape for any old saved courses
    const par = stats?.par ?? course.par;
    const cr  = stats?.cr  ?? course.cr;
    const sr  = stats?.sr  ?? course.sr;
    const estimated = stats?.estimated ?? false;

    const ch     = Calculator.courseHandicap(hi, cr, sr, par, course.holes);
    const ranges = Calculator.scoreRanges(ch, par);
    const holeLabel = course.holes === 'front9' ? 'Front 9'
                    : course.holes === 'back9'  ? 'Back 9'
                    : `${course.holes} holes`;

    displayCourseName.textContent = course.name;
    displayCourseMeta.textContent = `Par ${par} · CR ${cr} · SR ${sr} · ${holeLabel}`;

    // Estimated warning
    if (estimated) {
      estimatedWarning.classList.remove('hidden');
      estimatedWarning.onclick = onEstimatedTap || null;
    } else {
      estimatedWarning.classList.add('hidden');
      estimatedWarning.onclick = null;
    }
    displayCourseHandicap.textContent = ch;

    goldRange.textContent   = `${ranges.gold.low}–${ranges.gold.high}`;
    silverRange.textContent = `${ranges.silver.low}–${ranges.silver.high}`;
    bronzeRange.textContent = `${ranges.bronze.low}–${ranges.bronze.high}`;

    emptyState.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    // Re-trigger animation
    resultsSection.style.animation = 'none';
    void resultsSection.offsetHeight;
    resultsSection.style.animation = '';

    updateHIButton(hi);
  }

  function hideResults() {
    resultsSection.classList.add('hidden');
    emptyState.classList.remove('hidden');
    const stablefordBtn = document.getElementById('stablefordBtn');
    if (stablefordBtn) stablefordBtn.classList.remove('active');
  }

  function updateHIButton(hi) {
    hiEditValue.textContent = hi;
    hiEditBtn.classList.remove('hidden');
  }

  function showHIButton(hi) {
    hiEditValue.textContent = hi ?? '—';
    hiEditBtn.classList.remove('hidden');
  }

  function showDropdown(courses, onSelect) {
    searchDropdown.innerHTML = '';

    if (courses.length === 0) {
      searchDropdown.innerHTML = '<div class="search-dropdown-empty">No saved courses found.</div>';
    } else {
      courses.forEach(course => {
        const item = document.createElement('div');
        item.className = 'search-dropdown-item';
        const s = course.stats18 || course.statsFront || course.statsBack || {};
        const par = s.par ?? course.par ?? '—';
        const cr  = s.cr  ?? course.cr  ?? '—';
        const sr  = s.sr  ?? course.sr  ?? '—';
        item.innerHTML = `
          <span class="item-name">${escapeHtml(course.name)}</span>
          <span class="item-meta">Par ${par} · CR ${cr} · SR ${sr} · 18 holes</span>
        `;
        item.addEventListener('click', () => {
          hideDropdown();
          onSelect(course);
        });
        searchDropdown.appendChild(item);
      });
    }

    searchDropdown.classList.remove('hidden');
  }

  function hideDropdown() {
    searchDropdown.classList.add('hidden');
  }

  function openModal() {
    modalBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function showSearchSpinner() {
    const icon = document.querySelector('.search-icon');
    if (icon) icon.style.opacity = '0.3';
  }

  function hideSearchSpinner() {
    const icon = document.querySelector('.search-icon');
    if (icon) icon.style.opacity = '';
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { showResults, hideResults, showDropdown, hideDropdown, openModal, closeModal, updateHIButton, showHIButton, showSearchSpinner, hideSearchSpinner, getStats };
})();
